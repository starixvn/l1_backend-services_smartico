# Rocketor Integration Guide for Smartico Platform

> **Complete guide for using Rocketor as CI/CD orchestrator for plugin deployment**

---

## 📋 Table of Contents

1. [What is Rocketor](#what-is-rocketor)
2. [Rocketor Configuration File](#rocketor-configuration-file)
3. [CI/CD Pipeline with Rocketor](#cicd-pipeline-with-rocketor)
4. [Kubernetes Deployment](#kubernetes-deployment)
5. [HAProxy Integration](#haproxy-integration)
6. [Multi-Environment Setup](#multi-environment-setup)
7. [Complete Examples](#complete-examples)

---

## What is Rocketor

**Rocketor** is a CI/CD orchestration tool specifically designed for microservices deployment in Kubernetes environments. For Smartico, Rocketor:

- **Standardizes deployment** across all feature teams
- **Manages Kubernetes resources** (namespaces, services, deployments)
- **Validates plugin manifests** before deployment
- **Integrates with platform** for automatic plugin registration
- **Configures service discovery** for HAProxy routing

### Key Benefits

```
Traditional Approach (Manual):
├─ Each team writes custom CI/CD scripts
├─ Inconsistent deployment patterns
├─ Manual kubectl commands
├─ Hard to maintain and debug
└─ High cognitive load

With Rocketor:
├─ Single .rocketor.yml configuration
├─ Standardized workflow across teams
├─ Declarative deployment
├─ Built-in validation and rollback
└─ Low cognitive load
```

---

## Rocketor Configuration File

### Basic Structure

Every plugin repository contains a `.rocketor.yml` file at the root:

```yaml
#---------------------------------------------------------------------
# .rocketor.yml - Rocketor Configuration
# Repository: smartico-leaderboards-feature
#---------------------------------------------------------------------

# Project identification
project: smartico-leaderboards
version: ${ROCKETOR_VERSION:-1.0.0}  # Can be overridden by CI/CD variable

# Docker registry
registry:
  url: smartico.azurecr.io
  auth:
    username: ${ACR_USERNAME}
    password: ${ACR_PASSWORD}

# Plugin manifest
manifest:
  path: ./plugin.manifest.json
  validate: true  # Validate schema before deployment
  register_with_platform: true  # Auto-register with Smartico platform

# Build configuration
build:
  dockerfile: ./Dockerfile
  context: .
  target: production  # Multi-stage build target

  args:
    BUILD_VERSION: ${ROCKETOR_VERSION}
    BUILD_DATE: ${ROCKETOR_BUILD_DATE}
    COMMIT_SHA: ${ROCKETOR_COMMIT_SHA}

  cache_from:
    - ${REGISTRY_URL}/leaderboards:latest

  tags:
    - ${REGISTRY_URL}/leaderboards:${ROCKETOR_VERSION}
    - ${REGISTRY_URL}/leaderboards:latest
    - ${REGISTRY_URL}/leaderboards:${ROCKETOR_COMMIT_SHA}

# Kubernetes deployment
deploy:
  kubernetes:
    # Cluster context (defined in CI/CD environment)
    context: ${K8S_CONTEXT:-smartico-prod-cluster}

    # Namespace configuration
    namespace:
      name: smartico-leaderboards-${ROCKETOR_ENV}
      create_if_missing: true
      labels:
        team: leaderboards
        plugin: smartico.leaderboards
        environment: ${ROCKETOR_ENV}

    # Service configuration
    service:
      name: leaderboards-service
      type: ClusterIP
      port: 8080
      targetPort: 8080
      labels:
        app: leaderboards
        plugin: smartico.leaderboards

    # Deployment manifests
    manifests:
      - k8s/configmap.yaml
      - k8s/secret.yaml
      - k8s/deployment.yaml
      - k8s/service.yaml
      - k8s/hpa.yaml  # Horizontal Pod Autoscaler

    # Variable substitution in manifests
    variables:
      PLUGIN_VERSION: ${ROCKETOR_VERSION}
      PLUGIN_IMAGE: ${REGISTRY_URL}/leaderboards:${ROCKETOR_VERSION}
      NAMESPACE: smartico-leaderboards-${ROCKETOR_ENV}
      SERVICE_NAME: leaderboards-service
      REPLICAS: ${REPLICAS:-3}
      CPU_REQUEST: ${CPU_REQUEST:-200m}
      CPU_LIMIT: ${CPU_LIMIT:-1000m}
      MEMORY_REQUEST: ${MEMORY_REQUEST:-256Mi}
      MEMORY_LIMIT: ${MEMORY_LIMIT:-1Gi}

    # Deployment strategy
    strategy:
      type: RollingUpdate
      rollingUpdate:
        maxSurge: 1
        maxUnavailable: 0

    # Wait for deployment to be ready
    wait:
      enabled: true
      timeout: 300s
      conditions:
        - type: Available
          status: "True"
        - type: Progressing
          status: "True"
          reason: NewReplicaSetAvailable

# Health checks
health:
  # Wait for service to be healthy before marking deployment successful
  checks:
    - name: http_health
      type: http
      endpoint: http://${SERVICE_NAME}.${NAMESPACE}.svc.cluster.local:8080/health
      method: GET
      expected_status: 200
      timeout: 10s
      interval: 5s
      retries: 12  # Total wait: 60 seconds

    - name: readiness
      type: http
      endpoint: http://${SERVICE_NAME}.${NAMESPACE}.svc.cluster.local:8080/ready
      method: GET
      expected_status: 200
      timeout: 10s
      interval: 5s
      retries: 12

# Platform integration
platform:
  # Smartico platform API
  api_url: ${SMARTICO_PLATFORM_API:-https://api.smartico.ai}
  api_key: ${SMARTICO_PLATFORM_API_KEY}

  # Plugin registration
  registration:
    enabled: true
    endpoint: /admin/plugins/register
    payload:
      manifest: ${MANIFEST_JSON}  # Auto-loaded from plugin.manifest.json
      dockerImage: ${REGISTRY_URL}/leaderboards:${ROCKETOR_VERSION}
      namespace: ${NAMESPACE}
      serviceName: ${SERVICE_NAME}
      version: ${ROCKETOR_VERSION}
      deployedAt: ${ROCKETOR_BUILD_DATE}
      commitSha: ${ROCKETOR_COMMIT_SHA}

  # HAProxy configuration
  haproxy:
    enabled: true
    endpoint: /admin/haproxy/configure
    action: reload  # Options: reload, validate, dry-run

# Notifications
notifications:
  slack:
    enabled: true
    webhook_url: ${SLACK_WEBHOOK_URL}
    channels:
      - "#deployments"
      - "#team-leaderboards"
    events:
      - deployment_started
      - deployment_succeeded
      - deployment_failed
      - rollback_triggered

  email:
    enabled: false
    recipients:
      - leaderboards-team@smartico.ai

# Rollback configuration
rollback:
  enabled: true
  automatic: true  # Auto-rollback on failure
  conditions:
    - health_check_failed
    - deployment_timeout
    - high_error_rate  # Requires metrics integration

  strategy:
    type: previous_version  # Rollback to previous working version
    timeout: 120s

# Validation steps (run before deployment)
validation:
  steps:
    - name: validate_manifest_schema
      type: schema
      schema_url: https://platform.smartico.ai/schemas/plugin-manifest-v1.json

    - name: check_manifest_namespace
      type: custom
      command: |
        # Ensure namespace in manifest matches Rocketor config
        MANIFEST_NS=$(jq -r '.deployment.namespace' plugin.manifest.json)
        if [ "$MANIFEST_NS" != "${NAMESPACE}" ]; then
          echo "Namespace mismatch: manifest=$MANIFEST_NS, rocketor=${NAMESPACE}"
          exit 1
        fi

    - name: check_api_routes_unique
      type: platform_api
      endpoint: /admin/plugins/validate-routes
      method: POST
      payload:
        pluginId: smartico.leaderboards
        routes: ${MANIFEST_API_ENDPOINTS}

    - name: check_dependencies_available
      type: platform_api
      endpoint: /admin/plugins/check-dependencies
      method: POST
      payload:
        pluginId: smartico.leaderboards
        dependencies: ${MANIFEST_DEPENDENCIES}

    - name: docker_build_test
      type: build
      skip_push: true  # Just test build, don't push

    - name: run_unit_tests
      type: command
      command: docker run --rm ${REGISTRY_URL}/leaderboards:${ROCKETOR_VERSION} npm test

# Environments
environments:
  dev:
    namespace_suffix: dev
    replicas: 1
    cpu_request: 100m
    memory_request: 128Mi
    auto_deploy: true  # Deploy on every commit to main

  staging:
    namespace_suffix: staging
    replicas: 2
    cpu_request: 200m
    memory_request: 256Mi
    auto_deploy: false  # Manual approval required
    require_approval: true
    approvers:
      - leaderboards-team-lead
      - platform-architect

  prod:
    namespace_suffix: prod
    replicas: 3
    cpu_request: 200m
    memory_request: 256Mi
    auto_deploy: false
    require_approval: true
    approvers:
      - leaderboards-team-lead
      - platform-architect
      - cto

    # Production-specific settings
    canary:
      enabled: true
      steps:
        - traffic: 10%
          duration: 5m
        - traffic: 50%
          duration: 10m
        - traffic: 100%
          duration: 0m

      metrics:
        error_rate_threshold: 0.1%  # Rollback if error rate > 0.1%
        latency_p95_threshold: 200ms  # Rollback if p95 latency > 200ms

# Hooks (custom scripts at different stages)
hooks:
  pre_build:
    - echo "Starting build for ${ROCKETOR_VERSION}"
    - ./scripts/pre-build-checks.sh

  post_build:
    - echo "Build completed successfully"
    - ./scripts/scan-docker-image.sh ${REGISTRY_URL}/leaderboards:${ROCKETOR_VERSION}

  pre_deploy:
    - echo "Preparing deployment to ${ROCKETOR_ENV}"
    - ./scripts/backup-database.sh

  post_deploy:
    - echo "Deployment to ${ROCKETOR_ENV} completed"
    - ./scripts/smoke-tests.sh ${ROCKETOR_ENV}
    - ./scripts/update-documentation.sh ${ROCKETOR_VERSION}

  on_failure:
    - echo "Deployment failed, triggering alerts"
    - ./scripts/notify-on-call.sh

  on_rollback:
    - echo "Rolling back to previous version"
    - ./scripts/incident-report.sh

# Monitoring integration
monitoring:
  prometheus:
    enabled: true
    port: 9090
    path: /metrics

  grafana:
    enabled: true
    dashboard_url: https://grafana.smartico.ai/d/leaderboards

  alerts:
    - name: high_error_rate
      condition: error_rate > 0.5%
      duration: 5m
      action: notify

    - name: high_latency
      condition: p95_latency > 500ms
      duration: 5m
      action: notify

# Logging
logging:
  level: info  # debug, info, warn, error
  format: json
  outputs:
    - console
    - file: /var/log/rocketor/deployment.log
```

---

## CI/CD Pipeline with Rocketor

### GitHub Actions Example

```yaml
# .github/workflows/deploy.yml

name: Deploy Plugin with Rocketor

on:
  push:
    branches:
      - main
      - develop
    tags:
      - 'v*'
  pull_request:
    branches:
      - main

env:
  REGISTRY_URL: smartico.azurecr.io
  PROJECT_NAME: smartico-leaderboards

jobs:
  # Job 1: Build and Test
  build:
    name: Build Docker Image
    runs-on: ubuntu-latest

    steps:
      - name: Checkout code
        uses: actions/checkout@v3

      - name: Set up Rocketor
        run: |
          curl -sSL https://get.rocketor.io/install.sh | bash
          rocketor --version

      - name: Login to Azure Container Registry
        run: |
          echo ${{ secrets.ACR_PASSWORD }} | docker login ${{ env.REGISTRY_URL }} \
            -u ${{ secrets.ACR_USERNAME }} --password-stdin

      - name: Determine version
        id: version
        run: |
          if [[ "${{ github.ref }}" == refs/tags/* ]]; then
            VERSION="${GITHUB_REF#refs/tags/v}"
          else
            VERSION="${GITHUB_SHA:0:7}"
          fi
          echo "VERSION=$VERSION" >> $GITHUB_OUTPUT
          echo "Building version: $VERSION"

      - name: Validate plugin manifest
        run: rocketor validate-manifest

      - name: Build Docker image
        env:
          ROCKETOR_VERSION: ${{ steps.version.outputs.VERSION }}
          ROCKETOR_COMMIT_SHA: ${{ github.sha }}
          ROCKETOR_BUILD_DATE: ${{ github.event.head_commit.timestamp }}
        run: |
          rocketor build --no-push

      - name: Run tests
        run: |
          docker run --rm \
            ${{ env.REGISTRY_URL }}/leaderboards:${{ steps.version.outputs.VERSION }} \
            npm test

      - name: Security scan
        run: |
          docker run --rm \
            aquasec/trivy image \
            ${{ env.REGISTRY_URL }}/leaderboards:${{ steps.version.outputs.VERSION }}

      - name: Push Docker image
        env:
          ROCKETOR_VERSION: ${{ steps.version.outputs.VERSION }}
        run: rocketor push

  # Job 2: Deploy to Dev
  deploy_dev:
    name: Deploy to Development
    runs-on: ubuntu-latest
    needs: build
    if: github.ref == 'refs/heads/develop' || github.ref == 'refs/heads/main'
    environment: development

    steps:
      - name: Checkout code
        uses: actions/checkout@v3

      - name: Set up Rocketor
        run: |
          curl -sSL https://get.rocketor.io/install.sh | bash

      - name: Configure kubectl
        uses: azure/k8s-set-context@v3
        with:
          method: kubeconfig
          kubeconfig: ${{ secrets.KUBE_CONFIG_DEV }}

      - name: Deploy to Dev
        env:
          ROCKETOR_VERSION: ${{ needs.build.outputs.version }}
          ROCKETOR_ENV: dev
          K8S_CONTEXT: smartico-dev-cluster
          SMARTICO_PLATFORM_API: https://api-dev.smartico.ai
          SMARTICO_PLATFORM_API_KEY: ${{ secrets.PLATFORM_API_KEY_DEV }}
          SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK_URL }}
        run: |
          rocketor deploy --environment dev --wait

      - name: Run smoke tests
        run: |
          kubectl run smoke-test --rm -it --restart=Never \
            --image=curlimages/curl:latest \
            --namespace=smartico-leaderboards-dev \
            -- curl -f http://leaderboards-service:8080/health

  # Job 3: Deploy to Staging
  deploy_staging:
    name: Deploy to Staging
    runs-on: ubuntu-latest
    needs: [build, deploy_dev]
    if: github.ref == 'refs/heads/main'
    environment: staging

    steps:
      - name: Checkout code
        uses: actions/checkout@v3

      - name: Set up Rocketor
        run: curl -sSL https://get.rocketor.io/install.sh | bash

      - name: Configure kubectl
        uses: azure/k8s-set-context@v3
        with:
          method: kubeconfig
          kubeconfig: ${{ secrets.KUBE_CONFIG_STAGING }}

      - name: Deploy to Staging
        env:
          ROCKETOR_VERSION: ${{ needs.build.outputs.version }}
          ROCKETOR_ENV: staging
          K8S_CONTEXT: smartico-staging-cluster
          SMARTICO_PLATFORM_API: https://api-staging.smartico.ai
          SMARTICO_PLATFORM_API_KEY: ${{ secrets.PLATFORM_API_KEY_STAGING }}
        run: |
          rocketor deploy --environment staging --wait

      - name: Integration tests
        run: |
          npm install
          npm run test:integration -- --environment=staging

  # Job 4: Deploy to Production
  deploy_production:
    name: Deploy to Production
    runs-on: ubuntu-latest
    needs: [build, deploy_staging]
    if: startsWith(github.ref, 'refs/tags/v')
    environment: production

    steps:
      - name: Checkout code
        uses: actions/checkout@v3

      - name: Set up Rocketor
        run: curl -sSL https://get.rocketor.io/install.sh | bash

      - name: Configure kubectl
        uses: azure/k8s-set-context@v3
        with:
          method: kubeconfig
          kubeconfig: ${{ secrets.KUBE_CONFIG_PROD }}

      - name: Deploy to Production (Canary)
        env:
          ROCKETOR_VERSION: ${{ needs.build.outputs.version }}
          ROCKETOR_ENV: prod
          K8S_CONTEXT: smartico-prod-cluster
          SMARTICO_PLATFORM_API: https://api.smartico.ai
          SMARTICO_PLATFORM_API_KEY: ${{ secrets.PLATFORM_API_KEY_PROD }}
          SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK_URL }}
        run: |
          # Deploy with canary strategy
          rocketor deploy --environment prod --canary --wait

      - name: Monitor canary deployment
        run: |
          # Rocketor automatically monitors metrics and rolls back if thresholds exceeded
          # This step just waits for canary to complete
          rocketor canary status --wait-for-completion

      - name: Create GitHub release
        if: success()
        uses: actions/create-release@v1
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        with:
          tag_name: ${{ github.ref }}
          release_name: Release ${{ github.ref }}
          body: |
            ## Changes in this release
            - Plugin version: ${{ needs.build.outputs.version }}
            - Deployed to production
            - See [CHANGELOG.md](CHANGELOG.md) for details
```

---

## Kubernetes Deployment

### Example Kubernetes Manifests

**k8s/namespace.yaml** (auto-created by Rocketor):

```yaml
apiVersion: v1
kind: Namespace
metadata:
  name: smartico-leaderboards-${ROCKETOR_ENV}
  labels:
    team: leaderboards
    plugin: smartico.leaderboards
    environment: ${ROCKETOR_ENV}
    managed-by: rocketor
```

**k8s/configmap.yaml**:

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: leaderboards-config
  namespace: ${NAMESPACE}
  labels:
    app: leaderboards
    version: ${PLUGIN_VERSION}
data:
  # Plugin manifest (injected by Rocketor)
  plugin.manifest.json: |
    ${MANIFEST_JSON}

  # Application settings
  appsettings.json: |
    {
      "Logging": {
        "LogLevel": {
          "Default": "Information",
          "Microsoft": "Warning"
        }
      },
      "Plugin": {
        "Id": "smartico.leaderboards",
        "Version": "${PLUGIN_VERSION}",
        "Environment": "${ROCKETOR_ENV}"
      },
      "Platform": {
        "ApiUrl": "${SMARTICO_PLATFORM_API}",
        "SignalRHubUrl": "${SMARTICO_SIGNALR_HUB}"
      },
      "ConnectionStrings": {
        "DefaultConnection": "Host=${DB_HOST};Database=${DB_NAME};Username=${DB_USER};Password=${DB_PASSWORD}",
        "Redis": "${REDIS_CONNECTION_STRING}"
      }
    }
```

**k8s/deployment.yaml**:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: leaderboards-deployment
  namespace: ${NAMESPACE}
  labels:
    app: leaderboards
    plugin: smartico.leaderboards
    version: ${PLUGIN_VERSION}
spec:
  replicas: ${REPLICAS}
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 1
      maxUnavailable: 0

  selector:
    matchLabels:
      app: leaderboards

  template:
    metadata:
      labels:
        app: leaderboards
        plugin: smartico.leaderboards
        version: ${PLUGIN_VERSION}
      annotations:
        prometheus.io/scrape: "true"
        prometheus.io/port: "8080"
        prometheus.io/path: "/metrics"

    spec:
      serviceAccountName: leaderboards-sa

      containers:
        - name: leaderboards
          image: ${PLUGIN_IMAGE}
          imagePullPolicy: Always

          ports:
            - name: http
              containerPort: 8080
              protocol: TCP

          env:
            - name: ASPNETCORE_ENVIRONMENT
              value: "Production"
            - name: PLUGIN_VERSION
              value: ${PLUGIN_VERSION}
            - name: POD_NAME
              valueFrom:
                fieldRef:
                  fieldPath: metadata.name
            - name: POD_NAMESPACE
              valueFrom:
                fieldRef:
                  fieldPath: metadata.namespace
            - name: DB_PASSWORD
              valueFrom:
                secretKeyRef:
                  name: leaderboards-secrets
                  key: db-password
            - name: REDIS_PASSWORD
              valueFrom:
                secretKeyRef:
                  name: leaderboards-secrets
                  key: redis-password

          volumeMounts:
            - name: config
              mountPath: /app/config
              readOnly: true

          resources:
            requests:
              cpu: ${CPU_REQUEST}
              memory: ${MEMORY_REQUEST}
            limits:
              cpu: ${CPU_LIMIT}
              memory: ${MEMORY_LIMIT}

          livenessProbe:
            httpGet:
              path: /health
              port: http
            initialDelaySeconds: 30
            periodSeconds: 10
            timeoutSeconds: 5
            successThreshold: 1
            failureThreshold: 3

          readinessProbe:
            httpGet:
              path: /ready
              port: http
            initialDelaySeconds: 10
            periodSeconds: 5
            timeoutSeconds: 3
            successThreshold: 1
            failureThreshold: 3

      volumes:
        - name: config
          configMap:
            name: leaderboards-config

      imagePullSecrets:
        - name: acr-secret
```

**k8s/service.yaml**:

```yaml
apiVersion: v1
kind: Service
metadata:
  name: ${SERVICE_NAME}
  namespace: ${NAMESPACE}
  labels:
    app: leaderboards
    plugin: smartico.leaderboards
  annotations:
    service.beta.kubernetes.io/azure-load-balancer-internal: "true"
spec:
  type: ClusterIP
  selector:
    app: leaderboards
  ports:
    - name: http
      port: 8080
      targetPort: http
      protocol: TCP
  sessionAffinity: None
```

**k8s/hpa.yaml** (Horizontal Pod Autoscaler):

```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: leaderboards-hpa
  namespace: ${NAMESPACE}
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: leaderboards-deployment

  minReplicas: ${MIN_REPLICAS:-2}
  maxReplicas: ${MAX_REPLICAS:-10}

  metrics:
    - type: Resource
      resource:
        name: cpu
        target:
          type: Utilization
          averageUtilization: 70

    - type: Resource
      resource:
        name: memory
        target:
          type: Utilization
          averageUtilization: 80

  behavior:
    scaleDown:
      stabilizationWindowSeconds: 300
      policies:
        - type: Percent
          value: 50
          periodSeconds: 60

    scaleUp:
      stabilizationWindowSeconds: 0
      policies:
        - type: Percent
          value: 100
          periodSeconds: 15
        - type: Pods
          value: 2
          periodSeconds: 15
      selectPolicy: Max
```

---

## HAProxy Integration

### How Rocketor Updates HAProxy

```
┌─────────────────────────────────────────────────────────────────────┐
│  Rocketor → Platform → HAProxy Flow                                 │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  1. Rocketor Deploys to Kubernetes                                  │
│     rocketor deploy --environment prod                              │
│     ✓ Pods running                                                  │
│     ✓ Service created: leaderboards-service                         │
│                                                                     │
│  2. Rocketor Registers Plugin with Platform                         │
│     POST https://api.smartico.ai/admin/plugins/register             │
│     {                                                               │
│       "manifest": { ... },                                          │
│       "namespace": "smartico-leaderboards-prod",                    │
│       "serviceName": "leaderboards-service",                        │
│       "version": "1.0.0"                                            │
│     }                                                               │
│     ✓ Plugin registered in database                                 │
│                                                                     │
│  3. Platform Generates HAProxy Config                               │
│     ├─ Read manifest.provides.apiEndpoints                          │
│     ├─ Resolve K8s service FQDN:                                    │
│     │  leaderboards-service.smartico-leaderboards-prod.svc.cluster.local:8080
│     ├─ Generate backend configuration                               │
│     ├─ Generate frontend ACLs and rules                             │
│     └─ Add to /etc/haproxy/haproxy.cfg                              │
│                                                                     │
│  4. Platform Validates HAProxy Config                               │
│     haproxy -f /etc/haproxy/haproxy.cfg.new -c                     │
│     ✓ Configuration is valid                                        │
│                                                                     │
│  5. Platform Reloads HAProxy (Zero Downtime)                        │
│     haproxy -f /etc/haproxy/haproxy.cfg -sf $(pidof haproxy)       │
│     ✓ HAProxy reloaded                                              │
│     ✓ New routes active                                             │
│                                                                     │
│  6. Rocketor Verifies Health                                        │
│     GET http://leaderboards-service.smartico-leaderboards-prod.svc.cluster.local:8080/health
│     ✓ Service healthy                                               │
│                                                                     │
│  7. Rocketor Sends Success Notification                             │
│     ✓ Slack notification sent                                       │
│     ✓ Deployment marked as successful                               │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Multi-Environment Setup

### Environment-Specific Configuration

```yaml
# .rocketor.yml

environments:
  # Development environment
  dev:
    namespace_suffix: dev
    k8s_context: smartico-dev-cluster
    replicas: 1
    resources:
      cpu_request: 100m
      cpu_limit: 500m
      memory_request: 128Mi
      memory_limit: 512Mi

    variables:
      SMARTICO_PLATFORM_API: https://api-dev.smartico.ai
      DB_HOST: postgres-dev.smartico.internal
      DB_NAME: smartico_leaderboards_dev
      REDIS_HOST: redis-dev.smartico.internal
      LOG_LEVEL: debug

    auto_deploy: true
    canary: false

  # Staging environment
  staging:
    namespace_suffix: staging
    k8s_context: smartico-staging-cluster
    replicas: 2
    resources:
      cpu_request: 200m
      cpu_limit: 1000m
      memory_request: 256Mi
      memory_limit: 1Gi

    variables:
      SMARTICO_PLATFORM_API: https://api-staging.smartico.ai
      DB_HOST: postgres-staging.smartico.internal
      DB_NAME: smartico_leaderboards_staging
      REDIS_HOST: redis-staging.smartico.internal
      LOG_LEVEL: info

    auto_deploy: false
    require_approval: true
    approvers:
      - team-lead
    canary: false

  # Production environment
  prod:
    namespace_suffix: prod
    k8s_context: smartico-prod-cluster
    replicas: 3
    resources:
      cpu_request: 200m
      cpu_limit: 1000m
      memory_request: 256Mi
      memory_limit: 1Gi

    variables:
      SMARTICO_PLATFORM_API: https://api.smartico.ai
      DB_HOST: postgres-prod.smartico.internal
      DB_NAME: smartico_leaderboards_prod
      REDIS_HOST: redis-prod.smartico.internal
      LOG_LEVEL: warn

    auto_deploy: false
    require_approval: true
    approvers:
      - team-lead
      - platform-architect
      - cto

    canary:
      enabled: true
      steps:
        - traffic: 10%
          duration: 5m
        - traffic: 50%
          duration: 10m
        - traffic: 100%
```

---

## Complete Examples

### Example 1: Deploying New Plugin

```bash
# Team: Leaderboards Team
# Task: Deploy new leaderboards plugin v1.0.0

# Step 1: Ensure .rocketor.yml is configured
cat .rocketor.yml

# Step 2: Validate configuration
rocketor validate

# Step 3: Build Docker image
export ROCKETOR_VERSION=1.0.0
rocketor build

# Step 4: Run tests
docker run --rm smartico.azurecr.io/leaderboards:1.0.0 npm test

# Step 5: Push to registry
rocketor push

# Step 6: Deploy to dev
rocketor deploy --environment dev

# Step 7: Deploy to staging (after dev validation)
rocketor deploy --environment staging

# Step 8: Deploy to production (requires tag)
git tag v1.0.0
git push origin v1.0.0
# GitHub Actions automatically deploys to prod via canary
```

### Example 2: Rolling Back Deployment

```bash
# Rollback to previous version in production

# Option 1: Automatic rollback (if health checks fail)
# Rocketor automatically rolls back based on .rocketor.yml config

# Option 2: Manual rollback
rocketor rollback --environment prod

# Option 3: Rollback to specific version
rocketor rollback --environment prod --version 0.9.5
```

### Example 3: Debugging Deployment Issues

```bash
# Check deployment status
rocketor status --environment prod

# View deployment logs
rocketor logs --environment prod --follow

# Check health of deployed service
rocketor health --environment prod

# Describe Kubernetes resources
rocketor describe --environment prod

# Shell into running pod
rocketor exec --environment prod --pod leaderboards-deployment-abc123 -- /bin/bash
```

---

## Summary

**Rocketor provides:**

✅ **Standardized CI/CD** across all plugin teams
✅ **Automated plugin registration** with Smartico platform
✅ **HAProxy configuration** via platform API
✅ **Multi-environment support** (dev, staging, prod)
✅ **Canary deployments** for production safety
✅ **Automatic rollbacks** on failure
✅ **Health check validation** before marking success
✅ **Integration with monitoring** (Prometheus, Grafana)
✅ **Slack/email notifications** for deployment events

**Key files each plugin team maintains:**

1. `.rocketor.yml` - Deployment configuration
2. `plugin.manifest.json` - Plugin contract
3. `k8s/*.yaml` - Kubernetes manifests
4. `Dockerfile` - Container image definition

**Rocketor handles:**

- Building and pushing Docker images
- Deploying to Kubernetes clusters
- Registering with Smartico platform
- Triggering HAProxy reconfiguration
- Health checking and validation
- Rollback on failure
- Notifications

---

*Last Updated: November 13, 2025*
*Version: 1.0*
