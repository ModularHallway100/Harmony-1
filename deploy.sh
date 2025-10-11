#!/bin/bash

# Harmony Project Deployment Script
# This script automates the deployment process for the Harmony project

set -e  # Exit immediately if a command exits with a non-zero status

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
NAMESPACE="harmony"
KUBECONFIG="${KUBECONFIG:-$HOME/.kube/config}"
DOCKER_REGISTRY="ghcr.io/harmony-project"
GIT_BRANCH="${GIT_BRANCH:-main}"
ENVIRONMENT="${ENVIRONMENT:-staging}"

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to validate prerequisites
validate_prerequisites() {
    print_status "Validating prerequisites..."
    
    if ! command_exists kubectl; then
        print_error "kubectl is not installed. Please install kubectl first."
        exit 1
    fi
    
    if ! command_exists docker; then
        print_error "Docker is not installed. Please install Docker first."
        exit 1
    fi
    
    if ! command_exists git; then
        print_error "Git is not installed. Please install Git first."
        exit 1
    fi
    
    if ! command_exists jq; then
        print_error "jq is not installed. Please install jq first."
        exit 1
    fi
    
    if ! command_exists yq; then
        print_error "yq is not installed. Please install yq first."
        exit 1
    fi
    
    print_status "All prerequisites are installed."
}

# Function to check if we're connected to a Kubernetes cluster
check_kubernetes_connection() {
    print_status "Checking Kubernetes connection..."
    
    if ! kubectl cluster-info >/dev/null 2>&1; then
        print_error "Not connected to a Kubernetes cluster. Please configure kubectl."
        exit 1
    fi
    
    CURRENT_CONTEXT=$(kubectl config current-context)
    CURRENT_CLUSTER=$(kubectl config view -o jsonpath="{.contexts[?(@.name==\"$CURRENT_CONTEXT\")].context.cluster}")
    
    print_status "Connected to cluster: $CURRENT_CLUSTER"
}

# Function to create namespace if it doesn't exist
create_namespace() {
    print_status "Creating namespace $NAMESPACE if it doesn't exist..."
    
    if ! kubectl get namespace "$NAMESPACE" >/dev/null 2>&1; then
        kubectl create namespace "$NAMESPACE"
        print_status "Namespace $NAMESPACE created."
    else
        print_status "Namespace $NAMESPACE already exists."
    fi
}

# Function to build Docker images
build_docker_images() {
    print_status "Building Docker images..."
    
    # Get the latest commit hash for image tagging
    GIT_COMMIT=$(git rev-parse --short HEAD)
    
    # Build frontend image
    print_status "Building frontend image..."
    docker build -f Dockerfile.frontend -t "$DOCKER_REGISTRY/harmony-frontend:$GIT_COMMIT" -t "$DOCKER_REGISTRY/harmony-frontend:$ENVIRONMENT" .
    
    # Build backend image
    print_status "Building backend image..."
    docker build -f Dockerfile.backend -t "$DOCKER_REGISTRY/harmony-backend:$GIT_COMMIT" -t "$DOCKER_REGISTRY/harmony-backend:$ENVIRONMENT" .
    
    # Build worker image
    print_status "Building worker image..."
    docker build -f Dockerfile.worker -t "$DOCKER_REGISTRY/harmony-worker:$GIT_COMMIT" -t "$DOCKER_REGISTRY/harmony-worker:$ENVIRONMENT" .
    
    # Build AI service image
    print_status "Building AI service image..."
    docker build -f Dockerfile.ai-service -t "$DOCKER_REGISTRY/harmony-ai-service:$GIT_COMMIT" -t "$DOCKER_REGISTRY/harmony-ai-service:$ENVIRONMENT" .
    
    print_status "Docker images built successfully."
}

# Function to push Docker images
push_docker_images() {
    print_status "Pushing Docker images to registry..."
    
    # Push frontend image
    print_status "Pushing frontend image..."
    docker push "$DOCKER_REGISTRY/harmony-frontend:$GIT_COMMIT"
    docker push "$DOCKER_REGISTRY/harmony-frontend:$ENVIRONMENT"
    
    # Push backend image
    print_status "Pushing backend image..."
    docker push "$DOCKER_REGISTRY/harmony-backend:$GIT_COMMIT"
    docker push "$DOCKER_REGISTRY/harmony-backend:$ENVIRONMENT"
    
    # Push worker image
    print_status "Pushing worker image..."
    docker push "$DOCKER_REGISTRY/harmony-worker:$GIT_COMMIT"
    docker push "$DOCKER_REGISTRY/harmony-worker:$ENVIRONMENT"
    
    # Push AI service image
    print_status "Pushing AI service image..."
    docker push "$DOCKER_REGISTRY/harmony-ai-service:$GIT_COMMIT"
    docker push "$DOCKER_REGISTRY/harmony-ai-service:$ENVIRONMENT"
    
    print_status "Docker images pushed successfully."
}

# Function to apply Kubernetes manifests
apply_kubernetes_manifests() {
    print_status "Applying Kubernetes manifests..."
    
    # Apply namespace
    kubectl apply -f k8s/namespace.yaml
    
    # Apply secrets
    if [ "$ENVIRONMENT" = "production" ]; then
        print_warning "Production environment detected. Please ensure secrets are properly configured."
        kubectl apply -f k8s/secrets.yaml
    else
        print_status "Using test secrets for $ENVIRONMENT environment."
        kubectl apply -f k8s/secrets-test.yaml
    fi
    
    # Apply configmaps
    kubectl apply -f k8s/configmap.yaml
    
    # Apply persistent volume claims
    kubectl apply -f k8s/persistent-volume-claims.yaml
    
    # Apply deployments
    kubectl apply -f k8s/deployment.yaml
    
    # Apply services
    kubectl apply -f k8s/service.yaml
    
    # Apply ingress
    kubectl apply -f k8s/ingress.yaml
    
    # Apply horizontal pod autoscalers
    kubectl apply -f k8s/horizontal-pod-autoscaler.yaml
    
    print_status "Kubernetes manifests applied successfully."
}

# Function to wait for deployments to be ready
wait_for_deployments() {
    print_status "Waiting for deployments to be ready..."
    
    # Wait for all deployments to be ready
    kubectl wait --for=condition=available --timeout=600s deployment -n "$NAMESPACE" --all
    
    print_status "All deployments are ready."
}

# Function to run health checks
run_health_checks() {
    print_status "Running health checks..."
    
    # Wait for services to be available
    kubectl wait --for=condition=Ready --timeout=300s pods -l app=harmony-frontend -n "$NAMESPACE"
    kubectl wait --for=condition=Ready --timeout=300s pods -l app=harmony-backend -n "$NAMESPACE"
    kubectl wait --for=condition=Ready --timeout=300s pods -l app=harmony-worker -n "$NAMESPACE"
    kubectl wait --for=condition=Ready --timeout=300s pods -l app=harmony-ai-service -n "$NAMESPACE"
    
    # Check frontend health
    FRONTEND_URL=$(kubectl get ingress harmony-ingress -n "$NAMESPACE" -o jsonpath='{.spec.rules[0].host}')
    print_status "Checking frontend health at http://$FRONTEND_URL"
    
    # Check backend health
    BACKEND_URL=$(kubectl get ingress harmony-ingress -n "$NAMESPACE" -o jsonpath='{.spec.rules[0].host}')
    print_status "Checking backend health at http://$BACKEND_URL/api/health"
    
    print_status "Health checks completed."
}

# Function to run database migrations
run_database_migrations() {
    print_status "Running database migrations..."
    
    # Apply database migrations
    kubectl apply -f database/migrations/
    
    # Wait for database to be ready
    kubectl wait --for=condition=Ready --timeout=300s pod -l app=harmony-mongodb -n "$NAMESPACE"
    
    # Run migration job
    kubectl apply -f k8s/migration-job.yaml
    
    # Wait for migration job to complete
    kubectl wait --for=condition=complete --timeout=600s job/harmony-migration -n "$NAMESPACE"
    
    print_status "Database migrations completed."
}

# Function to run tests
run_tests() {
    print_status "Running tests..."
    
    # Run unit tests
    print_status "Running unit tests..."
    npm test -- --config jest.config.js
    
    # Run integration tests
    print_status "Running integration tests..."
    npm test -- --config jest.integration.config.js
    
    # Run E2E tests
    print_status "Running E2E tests..."
    npm test -- --config jest.e2e.config.js
    
    # Run performance tests
    print_status "Running performance tests..."
    npm test -- --config jest.performance.config.js
    
    print_status "All tests completed."
}

# Function to deploy to production
deploy_to_production() {
    print_status "Deploying to production..."
    
    # Set environment to production
    ENVIRONMENT="production"
    
    # Build and push Docker images
    build_docker_images
    push_docker_images
    
    # Apply Kubernetes manifests
    apply_kubernetes_manifests
    
    # Wait for deployments to be ready
    wait_for_deployments
    
    # Run health checks
    run_health_checks
    
    print_status "Production deployment completed successfully."
}

# Function to deploy to staging
deploy_to_staging() {
    print_status "Deploying to staging..."
    
    # Set environment to staging
    ENVIRONMENT="staging"
    
    # Build and push Docker images
    build_docker_images
    push_docker_images
    
    # Apply Kubernetes manifests
    apply_kubernetes_manifests
    
    # Wait for deployments to be ready
    wait_for_deployments
    
    # Run health checks
    run_health_checks
    
    print_status "Staging deployment completed successfully."
}

# Function to rollback deployment
rollback_deployment() {
    print_status "Rolling back deployment..."
    
    # Get the previous deployment version
    PREVIOUS_VERSION=$(kubectl get deployment harmony-frontend-deployment -n "$NAMESPACE" -o jsonpath='{.spec.template.metadata.annotations.previous-version}')
    
    if [ -z "$PREVIOUS_VERSION" ]; then
        print_error "No previous version found for rollback."
        exit 1
    fi
    
    # Rollback frontend deployment
    kubectl set image deployment/harmony-frontend-deployment harmony-frontend="$DOCKER_REGISTRY/harmony-frontend:$PREVIOUS_VERSION" -n "$NAMESPACE"
    
    # Rollback backend deployment
    kubectl set image deployment/harmony-backend-deployment harmony-backend="$DOCKER_REGISTRY/harmony-backend:$PREVIOUS_VERSION" -n "$NAMESPACE"
    
    # Rollback worker deployment
    kubectl set image deployment/harmony-worker-deployment harmony-worker="$DOCKER_REGISTRY/harmony-worker:$PREVIOUS_VERSION" -n "$NAMESPACE"
    
    # Rollback AI service deployment
    kubectl set image deployment/harmony-ai-service-deployment harmony-ai-service="$DOCKER_REGISTRY/harmony-ai-service:$PREVIOUS_VERSION" -n "$NAMESPACE"
    
    # Wait for deployments to be ready
    wait_for_deployments
    
    # Run health checks
    run_health_checks
    
    print_status "Rollback completed successfully."
}

# Function to clean up resources
cleanup() {
    print_status "Cleaning up resources..."
    
    # Delete all Harmony resources
    kubectl delete namespace "$NAMESPACE" --ignore-not-found=true
    
    # Remove Docker images
    docker rmi "$DOCKER_REGISTRY/harmony-frontend:$GIT_COMMIT" "$DOCKER_REGISTRY/harmony-frontend:$ENVIRONMENT" || true
    docker rmi "$DOCKER_REGISTRY/harmony-backend:$GIT_COMMIT" "$DOCKER_REGISTRY/harmony-backend:$ENVIRONMENT" || true
    docker rmi "$DOCKER_REGISTRY/harmony-worker:$GIT_COMMIT" "$DOCKER_REGISTRY/harmony-worker:$ENVIRONMENT" || true
    docker rmi "$DOCKER_REGISTRY/harmony-ai-service:$GIT_COMMIT" "$DOCKER_REGISTRY/harmony-ai-service:$ENVIRONMENT" || true
    
    print_status "Cleanup completed."
}

# Function to show help
show_help() {
    echo "Harmony Project Deployment Script"
    echo ""
    echo "Usage: $0 [command]"
    echo ""
    echo "Commands:"
    echo "  validate      Validate prerequisites and Kubernetes connection"
    echo "  build         Build Docker images"
    echo "  push          Push Docker images to registry"
    echo "  apply         Apply Kubernetes manifests"
    echo "  wait          Wait for deployments to be ready"
    echo "  health        Run health checks"
    echo "  migrate       Run database migrations"
    echo "  test          Run tests"
    echo "  deploy-staging Deploy to staging environment"
    echo "  deploy-prod   Deploy to production environment"
    echo "  rollback      Rollback to previous deployment"
    echo "  cleanup       Clean up resources"
    echo "  help          Show this help message"
    echo ""
    echo "Environment Variables:"
    echo "  NAMESPACE     Kubernetes namespace (default: harmony)"
    echo "  KUBECONFIG    Kubernetes configuration file path"
    echo "  DOCKER_REGISTRY Docker registry (default: ghcr.io/harmony-project)"
    echo "  GIT_BRANCH    Git branch (default: main)"
    echo "  ENVIRONMENT   Environment (default: staging)"
}

# Main script logic
main() {
    case "$1" in
        validate)
            validate_prerequisites
            check_kubernetes_connection
            ;;
        build)
            build_docker_images
            ;;
        push)
            push_docker_images
            ;;
        apply)
            create_namespace
            apply_kubernetes_manifests
            ;;
        wait)
            wait_for_deployments
            ;;
        health)
            run_health_checks
            ;;
        migrate)
            run_database_migrations
            ;;
        test)
            run_tests
            ;;
        deploy-staging)
            deploy_to_staging
            ;;
        deploy-prod)
            deploy_to_production
            ;;
        rollback)
            rollback_deployment
            ;;
        cleanup)
            cleanup
            ;;
        help|--help|-h)
            show_help
            ;;
        *)
            print_error "Unknown command: $1"
            show_help
            exit 1
            ;;
    esac
}

# Run main function with all arguments
main "$@"