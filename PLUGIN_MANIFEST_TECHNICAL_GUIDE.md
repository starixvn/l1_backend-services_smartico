# Plugin Manifest Technical Guide

> **How Smartico Platform Uses plugin.manifest.json - Complete Lifecycle**

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Plugin Discovery & Registration](#plugin-discovery--registration)
3. [Plugin Initialization](#plugin-initialization)
4. [Runtime Usage](#runtime-usage)
5. [API Gateway Integration](#api-gateway-integration)
6. [SignalR Hub Integration](#signalr-hub-integration)
7. [UI Shell Integration](#ui-shell-integration)
8. [Configuration Management](#configuration-management)
9. [Monitoring & Health Checks](#monitoring--health-checks)
10. [Deployment & Versioning](#deployment--versioning)
11. [Complete Code Examples](#complete-code-examples)

---

## Overview

The `plugin.manifest.json` file is the **contract between a feature plugin and the Smartico platform**. The platform uses this manifest throughout the entire plugin lifecycle, from discovery to runtime operation.

```
┌─────────────────────────────────────────────────────────────────────┐
│                   Plugin Manifest Lifecycle                         │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  [Discovery] → [Validation] → [Registration] → [Initialization]    │
│       ↓             ↓              ↓                ↓               │
│   Scan repos   Check schema   Add to registry   Start service      │
│                                                                     │
│  [Runtime Usage] → [Configuration] → [Monitoring] → [Shutdown]     │
│       ↓                 ↓               ↓              ↓            │
│   Route requests   Apply config    Track metrics   Graceful stop   │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Plugin Discovery & Registration

### How the Platform Finds Plugins

**At Build/Deploy Time using Rocketor:**

```
┌─────────────────────────────────────────────────────────────────────┐
│  CI/CD Pipeline (Feature Team's Repository) - Rocketor             │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  Repository: smartico-leaderboards-feature/                         │
│  ├── plugin.manifest.json                                           │
│  ├── .rocketor.yml                    ← Rocketor configuration     │
│  ├── Dockerfile                                                     │
│  └── k8s/                                                           │
│      ├── deployment.yaml                                            │
│      ├── service.yaml                                               │
│      └── configmap.yaml                                             │
│                                                                     │
│  1. Rocketor Reads Configuration                                    │
│     File: .rocketor.yml                                             │
│     ---                                                             │
│     project: smartico-leaderboards                                  │
│     namespace: smartico-leaderboards-prod                           │
│     service_name: leaderboards-service                              │
│     version: 1.0.0                                                  │
│     registry: smartico.azurecr.io                                   │
│     manifest_path: ./plugin.manifest.json                           │
│                                                                     │
│     build:                                                          │
│       dockerfile: ./Dockerfile                                      │
│       context: .                                                    │
│       args:                                                         │
│         - BUILD_VERSION=${VERSION}                                  │
│                                                                     │
│     deploy:                                                         │
│       kubernetes:                                                   │
│         manifests:                                                  │
│           - k8s/deployment.yaml                                     │
│           - k8s/service.yaml                                        │
│           - k8s/configmap.yaml                                      │
│         namespace: ${NAMESPACE}                                     │
│         context: smartico-prod-cluster                              │
│                                                                     │
│       validation:                                                   │
│         - extract_manifest: true                                    │
│         - validate_schema: true                                     │
│         - check_dependencies: true                                  │
│         - register_with_platform: true                              │
│                                                                     │
│  2. Build Docker Image                                              │
│     rocketor build                                                  │
│     → docker build -t smartico.azurecr.io/leaderboards:1.0.0 .     │
│     ✓ Image built successfully                                      │
│                                                                     │
│  3. Extract & Validate Manifest                                     │
│     rocketor validate-manifest                                      │
│     → Extract plugin.manifest.json from image                       │
│     → Validate against schema                                       │
│     ✓ Manifest schema valid                                         │
│     ✓ API routes unique                                             │
│     ✓ Dependencies available                                        │
│     ✓ Namespace matches: smartico-leaderboards-prod                 │
│     ✓ Service name matches: leaderboards-service                    │
│                                                                     │
│  4. Push to Registry                                                │
│     rocketor push                                                   │
│     → docker push smartico.azurecr.io/leaderboards:1.0.0           │
│     ✓ Image pushed successfully                                     │
│                                                                     │
│  5. Register with Platform                                          │
│     rocketor register-plugin                                        │
│     POST https://api.smartico.ai/admin/plugins/register             │
│     Body: {                                                         │
│       manifest: { ...plugin.manifest.json... },                     │
│       dockerImage: "smartico.azurecr.io/leaderboards:1.0.0",       │
│       namespace: "smartico-leaderboards-prod",                      │
│       serviceName: "leaderboards-service",                          │
│       version: "1.0.0"                                              │
│     }                                                               │
│     ✓ Plugin registered                                             │
│                                                                     │
│  6. Deploy to Kubernetes                                            │
│     rocketor deploy --environment prod                              │
│     → kubectl apply -f k8s/deployment.yaml -n smartico-leaderboards-prod
│     → kubectl apply -f k8s/service.yaml -n smartico-leaderboards-prod
│     → kubectl apply -f k8s/configmap.yaml -n smartico-leaderboards-prod
│     ✓ Deployment successful                                         │
│                                                                     │
│  7. Configure HAProxy (via Platform API)                            │
│     Platform reads manifest and updates HAProxy configuration       │
│     → Add backend: leaderboards-service.smartico-leaderboards-prod.svc.cluster.local
│     → Add routes from manifest.provides.apiEndpoints                │
│     → Configure rate limits, ACLs, health checks                    │
│     → Reload HAProxy: haproxy -f /etc/haproxy/haproxy.cfg -sf $(pidof haproxy)
│     ✓ HAProxy configured                                            │
│                                                                     │
│  8. Update Plugin Registry                                          │
│     Platform stores manifest + k8s metadata in registry database    │
│     ✓ Plugin active and ready to receive traffic                    │
└─────────────────────────────────────────────────────────────────────┘
```

### Plugin Registry Database Schema

```sql
-- Platform Core Database: smartico_platform

CREATE TABLE plugin_registry (
  plugin_id VARCHAR(100) PRIMARY KEY,
  plugin_name VARCHAR(200) NOT NULL,
  version VARCHAR(20) NOT NULL,
  manifest_json JSONB NOT NULL,
  docker_image VARCHAR(500) NOT NULL,

  -- Kubernetes metadata (from Rocketor)
  k8s_namespace VARCHAR(100) NOT NULL,
  k8s_service_name VARCHAR(100) NOT NULL,
  k8s_deployment_name VARCHAR(100),

  status VARCHAR(20) NOT NULL, -- 'registered', 'active', 'deprecated', 'disabled'
  registered_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE(plugin_id, version)
);

CREATE INDEX idx_plugin_status ON plugin_registry(status);
CREATE INDEX idx_plugin_manifest ON plugin_registry USING GIN(manifest_json);
CREATE INDEX idx_plugin_namespace ON plugin_registry(k8s_namespace);

-- Example row:
INSERT INTO plugin_registry VALUES (
  'smartico.leaderboards',
  'Advanced Leaderboards',
  '1.0.0',
  '{ ... full manifest JSON ... }',
  'smartico.azurecr.io/leaderboards:1.0.0',
  'smartico-leaderboards-prod',
  'leaderboards-service',
  'leaderboards-deployment',
  'active',
  NOW(),
  NOW()
);
```

### Plugin Validation Service

```csharp
// Platform Core: Smartico.Platform.PluginValidation

/// <summary>
/// Validates if a plugin is ready to be integrated into the platform
/// This runs BEFORE registration
/// </summary>
public class PluginValidationService
{
    private readonly IPluginRepository _pluginRepository;
    private readonly IManifestValidator _manifestValidator;
    private readonly IRouteRegistry _routeRegistry;
    private readonly IKubernetesClient _k8sClient;
    private readonly IHttpClientFactory _httpClientFactory;
    private readonly ILogger<PluginValidationService> _logger;

    /// <summary>
    /// Comprehensive validation to ensure plugin is ready to plug into platform
    /// </summary>
    public async Task<PluginValidationResult> ValidatePluginReadinessAsync(
        PluginManifest manifest,
        string dockerImage,
        string k8sNamespace,
        string k8sServiceName)
    {
        _logger.LogInformation($"Starting validation for plugin {manifest.PluginId} v{manifest.Version}");

        var validationErrors = new List<ValidationError>();
        var validationWarnings = new List<ValidationWarning>();

        // ═══════════════════════════════════════════════════════════════════
        // PHASE 1: Manifest Validation
        // ═══════════════════════════════════════════════════════════════════

        _logger.LogInformation("Phase 1: Validating manifest schema");

        var manifestValidation = await _manifestValidator.ValidateSchemaAsync(manifest);
        if (!manifestValidation.IsValid)
        {
            validationErrors.AddRange(manifestValidation.Errors.Select(e =>
                new ValidationError("ManifestSchema", e)
            ));
            // Fatal error - cannot proceed
            return PluginValidationResult.Failed(validationErrors, validationWarnings);
        }

        // ═══════════════════════════════════════════════════════════════════
        // PHASE 2: Dependency Validation
        // ═══════════════════════════════════════════════════════════════════

        _logger.LogInformation("Phase 2: Validating dependencies");

        // Check core platform version compatibility
        var currentPlatformVersion = GetCurrentPlatformVersion();
        if (!IsVersionCompatible(manifest.MinPlatformVersion, currentPlatformVersion))
        {
            validationErrors.Add(new ValidationError(
                "PlatformVersion",
                $"Plugin requires platform v{manifest.MinPlatformVersion}, but current version is v{currentPlatformVersion}"
            ));
        }

        // Check feature dependencies
        foreach (var dependency in manifest.Dependencies.Features)
        {
            var depPlugin = await _pluginRepository.GetActivePluginAsync(dependency.Id);

            if (depPlugin == null)
            {
                if (dependency.Optional)
                {
                    validationWarnings.Add(new ValidationWarning(
                        "OptionalDependencyMissing",
                        $"Optional dependency {dependency.Id} is not installed. Some features may be limited."
                    ));
                }
                else
                {
                    validationErrors.Add(new ValidationError(
                        "RequiredDependencyMissing",
                        $"Required dependency {dependency.Id} is not installed"
                    ));
                }
            }
            else
            {
                // Check version compatibility
                if (!IsVersionCompatible(dependency.Version, depPlugin.Version))
                {
                    validationErrors.Add(new ValidationError(
                        "DependencyVersionMismatch",
                        $"Dependency {dependency.Id} version mismatch: requires {dependency.Version}, found {depPlugin.Version}"
                    ));
                }
            }
        }

        // ═══════════════════════════════════════════════════════════════════
        // PHASE 3: Route Conflict Validation
        // ═══════════════════════════════════════════════════════════════════

        _logger.LogInformation("Phase 3: Validating API routes for conflicts");

        var existingRoutes = await _routeRegistry.GetAllRoutesAsync();

        foreach (var endpoint in manifest.Provides.ApiEndpoints)
        {
            var routeKey = $"{endpoint.Method}:{endpoint.Path}";

            // Check for exact match conflicts
            var conflictingRoute = existingRoutes.FirstOrDefault(r =>
                r.Method == endpoint.Method && r.Path == endpoint.Path
            );

            if (conflictingRoute != null)
            {
                validationErrors.Add(new ValidationError(
                    "RouteConflict",
                    $"Route {endpoint.Method} {endpoint.Path} conflicts with existing route from plugin {conflictingRoute.PluginId}"
                ));
            }

            // Check for path pattern conflicts (e.g., /api/users/{id} vs /api/users/{userId})
            var patternConflicts = existingRoutes.Where(r =>
                r.Method == endpoint.Method && IsPathPatternConflict(r.Path, endpoint.Path)
            ).ToList();

            foreach (var conflict in patternConflicts)
            {
                validationWarnings.Add(new ValidationWarning(
                    "RoutePatternSimilarity",
                    $"Route {endpoint.Method} {endpoint.Path} has similar pattern to {conflict.Path} from {conflict.PluginId}. May cause routing ambiguity."
                ));
            }
        }

        // ═══════════════════════════════════════════════════════════════════
        // PHASE 4: SignalR Event Validation
        // ═══════════════════════════════════════════════════════════════════

        _logger.LogInformation("Phase 4: Validating SignalR events");

        // Check if published events conflict with existing events
        var existingEvents = await _routeRegistry.GetAllPublishedEventsAsync();

        foreach (var publishedEvent in manifest.Provides.SignalREvents.Publishes)
        {
            var eventKey = $"{manifest.PluginId}:{publishedEvent.Event}";

            var conflictingEvent = existingEvents.FirstOrDefault(e =>
                e.PluginId == manifest.PluginId && e.EventName == publishedEvent.Event
            );

            if (conflictingEvent != null)
            {
                validationErrors.Add(new ValidationError(
                    "EventConflict",
                    $"Event {publishedEvent.Event} is already published by plugin {conflictingEvent.PluginId}"
                ));
            }
        }

        // Validate subscribed events exist
        foreach (var subscribedEvent in manifest.Provides.SignalREvents.Subscribes)
        {
            var eventKey = $"{subscribedEvent.From}:{subscribedEvent.Event}";

            var publisherExists = existingEvents.Any(e =>
                e.PluginId == subscribedEvent.From && e.EventName == subscribedEvent.Event
            );

            if (!publisherExists)
            {
                validationErrors.Add(new ValidationError(
                    "SubscribedEventNotFound",
                    $"Plugin subscribes to event {subscribedEvent.Event} from {subscribedEvent.From}, but this event is not published by any plugin"
                ));
            }
        }

        // ═══════════════════════════════════════════════════════════════════
        // PHASE 5: Kubernetes Service Validation
        // ═══════════════════════════════════════════════════════════════════

        _logger.LogInformation("Phase 5: Validating Kubernetes deployment");

        try
        {
            // Check if namespace exists
            var namespaceExists = await _k8sClient.NamespaceExistsAsync(k8sNamespace);
            if (!namespaceExists)
            {
                validationErrors.Add(new ValidationError(
                    "NamespaceNotFound",
                    $"Kubernetes namespace {k8sNamespace} does not exist"
                ));
            }

            // Check if service exists
            var serviceExists = await _k8sClient.ServiceExistsAsync(k8sNamespace, k8sServiceName);
            if (!serviceExists)
            {
                validationErrors.Add(new ValidationError(
                    "ServiceNotFound",
                    $"Kubernetes service {k8sServiceName} does not exist in namespace {k8sNamespace}"
                ));
            }
            else
            {
                // Check if service has endpoints (pods are running)
                var endpoints = await _k8sClient.GetServiceEndpointsAsync(k8sNamespace, k8sServiceName);
                if (endpoints == null || !endpoints.Any())
                {
                    validationErrors.Add(new ValidationError(
                        "NoServiceEndpoints",
                        $"Service {k8sServiceName} has no endpoints. No pods are running."
                    ));
                }
                else
                {
                    _logger.LogInformation($"Service has {endpoints.Count} endpoint(s)");
                }
            }
        }
        catch (Exception ex)
        {
            validationErrors.Add(new ValidationError(
                "KubernetesValidationFailed",
                $"Failed to validate Kubernetes resources: {ex.Message}"
            ));
        }

        // ═══════════════════════════════════════════════════════════════════
        // PHASE 6: Health Check Validation
        // ═══════════════════════════════════════════════════════════════════

        _logger.LogInformation("Phase 6: Validating service health");

        try
        {
            var serviceFqdn = $"{k8sServiceName}.{k8sNamespace}.svc.cluster.local";
            var servicePort = await _k8sClient.GetServicePortAsync(k8sNamespace, k8sServiceName);

            // Check health endpoint
            var healthUrl = $"http://{serviceFqdn}:{servicePort}{manifest.Monitoring.HealthCheck}";
            var healthResponse = await CheckEndpointAsync(healthUrl);

            if (!healthResponse.IsSuccessful)
            {
                validationErrors.Add(new ValidationError(
                    "HealthCheckFailed",
                    $"Health check endpoint {healthUrl} returned status {healthResponse.StatusCode}"
                ));
            }

            // Check readiness endpoint
            var readinessUrl = $"http://{serviceFqdn}:{servicePort}{manifest.Monitoring.ReadinessCheck}";
            var readinessResponse = await CheckEndpointAsync(readinessUrl);

            if (!readinessResponse.IsSuccessful)
            {
                validationErrors.Add(new ValidationError(
                    "ReadinessCheckFailed",
                    $"Readiness check endpoint {readinessUrl} returned status {readinessResponse.StatusCode}"
                ));
            }

            // Verify plugin manifest is accessible (injected via ConfigMap)
            var manifestUrl = $"http://{serviceFqdn}:{servicePort}/plugin-info";
            var manifestResponse = await CheckEndpointAsync(manifestUrl);

            if (!manifestResponse.IsSuccessful)
            {
                validationWarnings.Add(new ValidationWarning(
                    "PluginInfoEndpointMissing",
                    "Plugin does not expose /plugin-info endpoint. This is optional but recommended for debugging."
                ));
            }
        }
        catch (Exception ex)
        {
            validationErrors.Add(new ValidationError(
                "HealthCheckException",
                $"Exception during health check: {ex.Message}"
            ));
        }

        // ═══════════════════════════════════════════════════════════════════
        // PHASE 7: Configuration Schema Validation
        // ═══════════════════════════════════════════════════════════════════

        _logger.LogInformation("Phase 7: Validating configuration schema");

        if (manifest.Configuration?.Schema != null)
        {
            foreach (var configKey in manifest.Configuration.Schema.Keys)
            {
                var schema = manifest.Configuration.Schema[configKey];

                // Validate defaults match schema
                if (manifest.Configuration.Defaults.ContainsKey(configKey))
                {
                    var defaultValue = manifest.Configuration.Defaults[configKey];

                    if (!IsValueTypeValid(defaultValue, schema.Type))
                    {
                        validationErrors.Add(new ValidationError(
                            "ConfigurationDefaultTypeMismatch",
                            $"Configuration key '{configKey}' has default value type mismatch. Expected {schema.Type}."
                        ));
                    }

                    // Validate range for numeric types
                    if (schema.Type == "number")
                    {
                        var numValue = Convert.ToDouble(defaultValue);

                        if (schema.Min.HasValue && numValue < schema.Min.Value)
                        {
                            validationErrors.Add(new ValidationError(
                                "ConfigurationDefaultOutOfRange",
                                $"Configuration key '{configKey}' default value {numValue} is less than minimum {schema.Min}"
                            ));
                        }

                        if (schema.Max.HasValue && numValue > schema.Max.Value)
                        {
                            validationErrors.Add(new ValidationError(
                                "ConfigurationDefaultOutOfRange",
                                $"Configuration key '{configKey}' default value {numValue} is greater than maximum {schema.Max}"
                            ));
                        }
                    }
                }
                else
                {
                    validationWarnings.Add(new ValidationWarning(
                        "ConfigurationDefaultMissing",
                        $"Configuration key '{configKey}' is defined in schema but has no default value"
                    ));
                }
            }
        }

        // ═══════════════════════════════════════════════════════════════════
        // PHASE 8: Docker Image Validation
        // ═══════════════════════════════════════════════════════════════════

        _logger.LogInformation("Phase 8: Validating Docker image");

        try
        {
            // Check if Docker image exists and is accessible
            var imageExists = await _k8sClient.CheckImageExistsAsync(dockerImage);
            if (!imageExists)
            {
                validationErrors.Add(new ValidationError(
                    "DockerImageNotFound",
                    $"Docker image {dockerImage} not found or not accessible"
                ));
            }
        }
        catch (Exception ex)
        {
            validationWarnings.Add(new ValidationWarning(
                "DockerImageValidationSkipped",
                $"Could not validate Docker image existence: {ex.Message}"
            ));
        }

        // ═══════════════════════════════════════════════════════════════════
        // PHASE 9: Resource Requirements Validation
        // ═══════════════════════════════════════════════════════════════════

        _logger.LogInformation("Phase 9: Validating resource requirements");

        if (manifest.Resources != null)
        {
            // Check if cluster has enough resources
            var clusterResources = await _k8sClient.GetClusterResourcesAsync();

            var requestedCpu = ParseCpuResource(manifest.Resources.Cpu.Request);
            var requestedMemory = ParseMemoryResource(manifest.Resources.Memory.Request);

            if (clusterResources.AvailableCpu < requestedCpu)
            {
                validationWarnings.Add(new ValidationWarning(
                    "InsufficientCpuResources",
                    $"Cluster may not have sufficient CPU. Requested: {manifest.Resources.Cpu.Request}, Available: {clusterResources.AvailableCpu}m"
                ));
            }

            if (clusterResources.AvailableMemory < requestedMemory)
            {
                validationWarnings.Add(new ValidationWarning(
                    "InsufficientMemoryResources",
                    $"Cluster may not have sufficient memory. Requested: {manifest.Resources.Memory.Request}, Available: {clusterResources.AvailableMemory}Mi"
                ));
            }
        }

        // ═══════════════════════════════════════════════════════════════════
        // FINAL RESULT
        // ═══════════════════════════════════════════════════════════════════

        var isValid = !validationErrors.Any();

        if (isValid)
        {
            _logger.LogInformation($"✓ Plugin {manifest.PluginId} passed all validation checks");
            if (validationWarnings.Any())
            {
                _logger.LogWarning($"⚠ {validationWarnings.Count} warning(s) found");
            }
        }
        else
        {
            _logger.LogError($"✗ Plugin {manifest.PluginId} failed validation with {validationErrors.Count} error(s)");
        }

        return new PluginValidationResult
        {
            IsValid = isValid,
            Errors = validationErrors,
            Warnings = validationWarnings,
            PluginId = manifest.PluginId,
            Version = manifest.Version,
            ValidatedAt = DateTime.UtcNow
        };
    }

    private async Task<EndpointCheckResult> CheckEndpointAsync(string url)
    {
        try
        {
            var client = _httpClientFactory.CreateClient();
            client.Timeout = TimeSpan.FromSeconds(10);

            var response = await client.GetAsync(url);

            return new EndpointCheckResult
            {
                IsSuccessful = response.IsSuccessStatusCode,
                StatusCode = (int)response.StatusCode
            };
        }
        catch (Exception ex)
        {
            return new EndpointCheckResult
            {
                IsSuccessful = false,
                StatusCode = 0,
                Error = ex.Message
            };
        }
    }

    private bool IsPathPatternConflict(string existingPath, string newPath)
    {
        // Simple pattern conflict detection
        // e.g., /api/users/{id} vs /api/users/{userId}
        var existingSegments = existingPath.Split('/');
        var newSegments = newPath.Split('/');

        if (existingSegments.Length != newSegments.Length)
            return false;

        for (int i = 0; i < existingSegments.Length; i++)
        {
            var existingSeg = existingSegments[i];
            var newSeg = newSegments[i];

            // Both are parameters
            if (existingSeg.StartsWith("{") && newSeg.StartsWith("{"))
                continue;

            // Exact match
            if (existingSeg == newSeg)
                continue;

            // Different segments
            return false;
        }

        return true;
    }

    private bool IsValueTypeValid(object value, string expectedType)
    {
        return expectedType.ToLower() switch
        {
            "number" => value is int or long or double or decimal,
            "string" => value is string,
            "boolean" => value is bool,
            _ => false
        };
    }

    private double ParseCpuResource(string cpu)
    {
        // Parse CPU resource like "200m" = 200 millicores
        if (cpu.EndsWith("m"))
            return double.Parse(cpu.TrimEnd('m'));

        return double.Parse(cpu) * 1000; // cores to millicores
    }

    private long ParseMemoryResource(string memory)
    {
        // Parse memory resource like "256Mi" = 256 mebibytes
        if (memory.EndsWith("Mi"))
            return long.Parse(memory.Replace("Mi", ""));

        if (memory.EndsWith("Gi"))
            return long.Parse(memory.Replace("Gi", "")) * 1024;

        return long.Parse(memory);
    }
}

public class PluginValidationResult
{
    public bool IsValid { get; set; }
    public List<ValidationError> Errors { get; set; } = new();
    public List<ValidationWarning> Warnings { get; set; } = new();
    public string PluginId { get; set; }
    public string Version { get; set; }
    public DateTime ValidatedAt { get; set; }
}

public class ValidationError
{
    public string Code { get; set; }
    public string Message { get; set; }

    public ValidationError(string code, string message)
    {
        Code = code;
        Message = message;
    }
}

public class ValidationWarning
{
    public string Code { get; set; }
    public string Message { get; set; }

    public ValidationWarning(string code, string message)
    {
        Code = code;
        Message = message;
    }
}

public class EndpointCheckResult
{
    public bool IsSuccessful { get; set; }
    public int StatusCode { get; set; }
    public string Error { get; set; }
}
```

### Plugin Registration Service

```csharp
// Platform Core: Smartico.Platform.PluginRegistry

/// <summary>
/// Registers validated plugins into the platform
/// This runs AFTER validation passes
/// </summary>
public class PluginRegistrationService
{
    private readonly IPluginRepository _pluginRepository;
    private readonly IPluginValidationService _validationService;
    private readonly IHAProxyConfigurator _haproxyConfigurator;
    private readonly IEventBus _eventBus;
    private readonly ILogger<PluginRegistrationService> _logger;

    /// <summary>
    /// Register plugin after validation passes
    /// </summary>
    public async Task<PluginRegistrationResult> RegisterPluginAsync(
        PluginManifest manifest,
        string dockerImage,
        string k8sNamespace,
        string k8sServiceName)
    {
        _logger.LogInformation($"Starting registration for plugin {manifest.PluginId} v{manifest.Version}");

        // ═══════════════════════════════════════════════════════════════════
        // STEP 1: Validate Plugin Readiness
        // ═══════════════════════════════════════════════════════════════════

        var validationResult = await _validationService.ValidatePluginReadinessAsync(
            manifest,
            dockerImage,
            k8sNamespace,
            k8sServiceName
        );

        if (!validationResult.IsValid)
        {
            _logger.LogError($"Plugin {manifest.PluginId} failed validation");

            return PluginRegistrationResult.Failed(
                validationResult.Errors.Select(e => e.Message).ToList()
            );
        }

        if (validationResult.Warnings.Any())
        {
            _logger.LogWarning(
                $"Plugin {manifest.PluginId} has {validationResult.Warnings.Count} warning(s)"
            );
        }

        // ═══════════════════════════════════════════════════════════════════
        // STEP 2: Store in Plugin Registry
        // ═══════════════════════════════════════════════════════════════════

        var plugin = new Plugin
        {
            PluginId = manifest.PluginId,
            PluginName = manifest.PluginName,
            Version = manifest.Version,
            ManifestJson = JsonSerializer.Serialize(manifest),
            DockerImage = dockerImage,

            // Kubernetes metadata
            K8sNamespace = k8sNamespace,
            K8sServiceName = k8sServiceName,
            K8sDeploymentName = $"{k8sServiceName.Replace("-service", "")}-deployment",

            Status = PluginStatus.Registered,
            RegisteredAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        await _pluginRepository.AddAsync(plugin);

        _logger.LogInformation($"✓ Plugin {manifest.PluginId} stored in registry");

        // ═══════════════════════════════════════════════════════════════════
        // STEP 3: Configure HAProxy Routes
        // ═══════════════════════════════════════════════════════════════════

        try
        {
            await _haproxyConfigurator.ConfigureRoutesAsync(plugin, manifest);
            _logger.LogInformation($"✓ HAProxy configured for {manifest.PluginId}");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Failed to configure HAProxy for {manifest.PluginId}");

            // Rollback registration
            await _pluginRepository.DeleteAsync(plugin.PluginId);

            return PluginRegistrationResult.Failed(new[]
            {
                $"HAProxy configuration failed: {ex.Message}"
            });
        }

        // ═══════════════════════════════════════════════════════════════════
        // STEP 4: Update Plugin Status to Active
        // ═══════════════════════════════════════════════════════════════════

        plugin.Status = PluginStatus.Active;
        await _pluginRepository.UpdateAsync(plugin);

        _logger.LogInformation($"✓ Plugin {manifest.PluginId} status set to Active");

        // ═══════════════════════════════════════════════════════════════════
        // STEP 5: Publish Registration Event
        // ═══════════════════════════════════════════════════════════════════

        await _eventBus.PublishAsync(new PluginRegisteredEvent
        {
            PluginId = manifest.PluginId,
            Version = manifest.Version,
            Manifest = manifest,
            Namespace = k8sNamespace,
            ServiceName = k8sServiceName,
            RegisteredAt = plugin.RegisteredAt
        });

        _logger.LogInformation($"✓ Plugin registration event published");

        // ═══════════════════════════════════════════════════════════════════
        // STEP 6: Return Success Result
        // ═══════════════════════════════════════════════════════════════════

        return PluginRegistrationResult.Success(
            plugin.PluginId,
            validationResult.Warnings.Select(w => w.Message).ToList()
        );
    }

    /// <summary>
    /// Unregister plugin from platform
    /// </summary>
    public async Task<PluginUnregistrationResult> UnregisterPluginAsync(string pluginId)
    {
        _logger.LogInformation($"Starting unregistration for plugin {pluginId}");

        var plugin = await _pluginRepository.GetActivePluginAsync(pluginId);
        if (plugin == null)
        {
            return PluginUnregistrationResult.Failed($"Plugin {pluginId} not found");
        }

        var manifest = JsonSerializer.Deserialize<PluginManifest>(plugin.ManifestJson);

        // Remove HAProxy configuration
        await _haproxyConfigurator.RemoveRoutesAsync(plugin, manifest);

        // Mark as deprecated
        plugin.Status = PluginStatus.Deprecated;
        plugin.UpdatedAt = DateTime.UtcNow;
        await _pluginRepository.UpdateAsync(plugin);

        // Publish unregistration event
        await _eventBus.PublishAsync(new PluginUnregisteredEvent
        {
            PluginId = pluginId,
            UnregisteredAt = DateTime.UtcNow
        });

        _logger.LogInformation($"✓ Plugin {pluginId} unregistered successfully");

        return PluginUnregistrationResult.Success(pluginId);
    }
}

public class PluginRegistrationResult
{
    public bool IsSuccessful { get; set; }
    public string PluginId { get; set; }
    public List<string> Errors { get; set; } = new();
    public List<string> Warnings { get; set; } = new();

    public static PluginRegistrationResult Success(string pluginId, List<string> warnings = null)
    {
        return new PluginRegistrationResult
        {
            IsSuccessful = true,
            PluginId = pluginId,
            Warnings = warnings ?? new List<string>()
        };
    }

    public static PluginRegistrationResult Failed(IEnumerable<string> errors)
    {
        return new PluginRegistrationResult
        {
            IsSuccessful = false,
            Errors = errors.ToList()
        };
    }

    public static PluginRegistrationResult Failed(string error)
    {
        return Failed(new[] { error });
    }
}

public class PluginUnregistrationResult
{
    public bool IsSuccessful { get; set; }
    public string PluginId { get; set; }
    public string Error { get; set; }

    public static PluginUnregistrationResult Success(string pluginId)
    {
        return new PluginUnregistrationResult
        {
            IsSuccessful = true,
            PluginId = pluginId
        };
    }

    public static PluginUnregistrationResult Failed(string error)
    {
        return new PluginUnregistrationResult
        {
            IsSuccessful = false,
            Error = error
        };
    }
}
```

---

## Plugin Initialization

### Platform Startup Sequence

```
┌─────────────────────────────────────────────────────────────────────┐
│  Platform Startup (Kubernetes Pod Starting)                         │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  1. Core Services Start                                             │
│     ├─ Database connections                                         │
│     ├─ Redis connection                                             │
│     ├─ SignalR hub initialization                                   │
│     └─ API Gateway startup                                          │
│                                                                     │
│  2. Load Plugin Registry                                            │
│     ├─ Query: SELECT * FROM plugin_registry WHERE status='active'   │
│     ├─ Result: 6 active plugins found                               │
│     └─ Parse each manifest JSON                                     │
│                                                                     │
│  3. Initialize Each Plugin                                          │
│     ├─ smartico.missions (v1.5.0)                                   │
│     ├─ smartico.bonuses (v2.1.0)                                    │
│     ├─ smartico.leaderboards (v1.0.0) ← NEW PLUGIN                  │
│     ├─ smartico.tournaments (v1.8.0)                                │
│     ├─ smartico.jackpots (v2.0.0)                                   │
│     └─ smartico.profiles (v1.3.0)                                   │
│                                                                     │
│  4. Dependency Resolution (Topological Sort)                        │
│     Order plugins by dependencies:                                  │
│     ├─ 1st: profiles (no dependencies)                              │
│     ├─ 2nd: missions (depends on profiles)                          │
│     ├─ 3rd: bonuses (depends on profiles)                           │
│     ├─ 4th: leaderboards (depends on missions - optional)           │
│     ├─ 5th: tournaments (depends on missions, bonuses)              │
│     └─ 6th: jackpots (depends on profiles, bonuses)                 │
│                                                                     │
│  5. Configure API Gateway Routes                                    │
│     For each plugin.provides.apiEndpoints:                          │
│     ├─ Register route in gateway                                    │
│     ├─ Configure rate limits                                        │
│     ├─ Setup authentication                                         │
│     └─ Configure caching                                            │
│                                                                     │
│  6. Configure SignalR Hub                                           │
│     For each plugin.provides.signalrEvents:                         │
│     ├─ Register event publishers                                    │
│     ├─ Register event subscribers                                   │
│     └─ Setup routing between plugins                                │
│                                                                     │
│  7. Register UI Components                                          │
│     For each plugin.provides.uiComponent:                           │
│     ├─ Add to dashboard navigation                                  │
│     ├─ Configure routing                                            │
│     └─ Setup lazy loading                                           │
│                                                                     │
│  8. Health Check Each Plugin                                        │
│     GET http://leaderboards-service/health                          │
│     ✓ All plugins healthy                                           │
│                                                                     │
│  9. Mark Platform Ready                                             │
│     Platform status: READY                                          │
│     Ready to accept requests                                        │
└─────────────────────────────────────────────────────────────────────┘
```

### Plugin Initialization Service

```csharp
// Platform Core: Smartico.Platform.PluginLoader

public class PluginInitializationService
{
    private readonly IPluginRepository _pluginRepository;
    private readonly IApiGateway _apiGateway;
    private readonly ISignalRHub _signalRHub;
    private readonly IUIShell _uiShell;
    private readonly ILogger<PluginInitializationService> _logger;

    /// <summary>
    /// Called during platform startup
    /// </summary>
    public async Task InitializeAllPluginsAsync()
    {
        _logger.LogInformation("Starting plugin initialization...");

        // STEP 1: Load all active plugins from registry
        var plugins = await _pluginRepository.GetActivePluginsAsync();
        _logger.LogInformation($"Found {plugins.Count} active plugins");

        // STEP 2: Parse manifests
        var manifests = plugins
            .Select(p => new
            {
                Plugin = p,
                Manifest = JsonSerializer.Deserialize<PluginManifest>(p.ManifestJson)
            })
            .ToList();

        // STEP 3: Topological sort by dependencies
        var sortedManifests = TopologicalSort(manifests);

        // STEP 4: Initialize each plugin in order
        foreach (var item in sortedManifests)
        {
            try
            {
                await InitializePluginAsync(item.Plugin, item.Manifest);
                _logger.LogInformation(
                    $"✓ Plugin initialized: {item.Manifest.PluginId} v{item.Manifest.Version}"
                );
            }
            catch (Exception ex)
            {
                _logger.LogError(ex,
                    $"✗ Failed to initialize plugin: {item.Manifest.PluginId}"
                );
                throw; // Fail fast on plugin initialization errors
            }
        }

        _logger.LogInformation("All plugins initialized successfully");
    }

    /// <summary>
    /// Initialize a single plugin
    /// </summary>
    private async Task InitializePluginAsync(Plugin plugin, PluginManifest manifest)
    {
        // STEP 1: Check plugin health
        var healthUrl = $"http://{plugin.ServiceName}/{manifest.Monitoring.HealthCheck}";
        var isHealthy = await CheckHealthAsync(healthUrl);
        if (!isHealthy)
        {
            throw new PluginNotHealthyException(
                $"Plugin {manifest.PluginId} health check failed"
            );
        }

        // STEP 2: Configure API routes
        await ConfigureApiRoutesAsync(plugin.ServiceName, manifest);

        // STEP 3: Configure SignalR events
        await ConfigureSignalREventsAsync(manifest);

        // STEP 4: Register UI component
        await RegisterUIComponentAsync(manifest);

        // STEP 5: Load configuration
        await LoadPluginConfigurationAsync(manifest);

        // STEP 6: Update status
        plugin.Status = PluginStatus.Active;
        await _pluginRepository.UpdateAsync(plugin);
    }

    /// <summary>
    /// Topological sort to resolve dependencies
    /// </summary>
    private List<T> TopologicalSort<T>(List<T> items)
        where T : IHasDependencies
    {
        var sorted = new List<T>();
        var visited = new HashSet<string>();

        void Visit(T item)
        {
            if (visited.Contains(item.PluginId))
                return;

            foreach (var dep in item.Dependencies)
            {
                var depItem = items.FirstOrDefault(i => i.PluginId == dep.Id);
                if (depItem != null)
                    Visit(depItem);
            }

            visited.Add(item.PluginId);
            sorted.Add(item);
        }

        foreach (var item in items)
        {
            Visit(item);
        }

        return sorted;
    }
}
```

---

## Runtime Usage

### Request Flow with Plugin Manifest through HAProxy

```
┌─────────────────────────────────────────────────────────────────────┐
│  User Request: GET /api/leaderboards?operatorId=lucky-casino        │
│  From: Mobile App / Web Dashboard                                   │
└─────────────────────────────────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│  HAProxy API Gateway (Manifest-Driven Configuration)                │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  1. Route Matching (ACLs from manifest)                             │
│     ACL: acl is_leaderboards path_beg /api/leaderboards             │
│     ├─ Match found: /api/leaderboards                               │
│     ├─ Plugin: smartico.leaderboards                                │
│     └─ Backend: backend_smartico_leaderboards                       │
│                                                                     │
│  2. Authentication Check (from manifest.auth: "required")           │
│     ACL: acl has_auth_header req.hdr(Authorization) -m found        │
│     Rule: http-request deny deny_status 401 if !has_auth_header    │
│     ├─ Authorization header present: Bearer eyJ...                  │
│     ├─ Validate JWT token (via Lua script or external auth)        │
│     └─ Extract operatorId from JWT claims                           │
│                                                                     │
│  3. Rate Limiting (from manifest.rateLimit: 500 req/1m)             │
│     Stick-table: type ip size 1m expire 1m store http_req_rate(1m) │
│     Rule: http-request track-sc0 src                                │
│     Rule: http-request deny deny_status 429 if { sc_http_req_rate(0) gt 500 }
│     ├─ Check stick-table for client IP: 203.0.113.1                 │
│     ├─ Current rate: 45 req/min                                     │
│     └─ Allow request (under limit)                                  │
│                                                                     │
│  4. Add Custom Headers (from manifest)                              │
│     http-request set-header X-Plugin-Id smartico.leaderboards       │
│     http-request set-header X-Plugin-Version 1.0.0                  │
│     http-request set-header X-Request-Id %[uuid()]                  │
│     http-request set-header X-Operator-Id lucky-casino              │
│                                                                     │
│  5. Health Check Backend                                            │
│     Backend: leaderboards-service.smartico-leaderboards-prod.svc.cluster.local:8080
│     Health check: GET /health (from manifest.monitoring.healthCheck)│
│     Status: UP (200 OK)                                             │
│                                                                     │
│  6. Forward Request to Kubernetes Service                           │
│     use_backend backend_smartico_leaderboards                       │
│     → http://leaderboards-service.smartico-leaderboards-prod.svc.cluster.local:8080/api/leaderboards
│     Headers:                                                        │
│       Authorization: Bearer eyJ...                                  │
│       X-Plugin-Id: smartico.leaderboards                            │
│       X-Plugin-Version: 1.0.0                                       │
│       X-Request-Id: 550e8400-e29b-41d4-a716-446655440000            │
│       X-Operator-Id: lucky-casino                                   │
│       X-Forwarded-For: 203.0.113.1                                  │
│       X-Real-IP: 203.0.113.1                                        │
└─────────────────────────────────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│  Kubernetes Service Discovery                                       │
├─────────────────────────────────────────────────────────────────────┤
│  Service: leaderboards-service                                      │
│  Namespace: smartico-leaderboards-prod                              │
│  Selector: app=leaderboards                                         │
│                                                                     │
│  Endpoints (Pod IPs):                                               │
│  ├─ 10.244.1.15:8080 (leaderboards-deployment-7d9f8-abc12)         │
│  ├─ 10.244.2.23:8080 (leaderboards-deployment-7d9f8-def34)         │
│  └─ 10.244.3.18:8080 (leaderboards-deployment-7d9f8-ghi56)         │
│                                                                     │
│  Load balancing: Round-robin → Selects 10.244.1.15:8080            │
└─────────────────────────────────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│  Leaderboards Pod (Container)                                       │
│  Pod: leaderboards-deployment-7d9f8-abc12                           │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  1. Receive Request                                                 │
│     GET /api/leaderboards                                           │
│     Headers: X-Operator-Id: lucky-casino                            │
│                                                                     │
│  2. Process Request                                                 │
│     ├─ Extract operatorId from header                               │
│     ├─ Query PostgreSQL (filtered by operatorId)                    │
│     │  SELECT * FROM leaderboards WHERE operator_id = 'lucky-casino'│
│     └─ Fetch from Redis cache if available                          │
│                                                                     │
│  3. Send Response                                                   │
│     Status: 200 OK                                                  │
│     Body: [{ leaderboardId: "lb-1", name: "Weekly Race", ... }]    │
└─────────────────────────────────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│  HAProxy (Response Processing)                                      │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  1. Add Cache Headers (from manifest.cache: ttl=60)                 │
│     http-response set-header Cache-Control "public, max-age=60"     │
│                                                                     │
│  2. CORS Headers (platform-wide config)                             │
│     http-response set-header Access-Control-Allow-Origin "*"        │
│                                                                     │
│  3. Record Metrics (sent to monitoring system)                      │
│     ├─ Request latency: 145ms                                       │
│     ├─ Status: 200                                                  │
│     ├─ Backend: backend_smartico_leaderboards                       │
│     └─ Plugin: smartico.leaderboards                                │
│                                                                     │
│  4. Return to Client                                                │
│     Status: 200 OK                                                  │
│     Headers:                                                        │
│       Cache-Control: public, max-age=60                             │
│       Access-Control-Allow-Origin: *                                │
│       X-Request-Id: 550e8400-e29b-41d4-a716-446655440000            │
│     Body: [{ leaderboardId: "lb-1", name: "Weekly Race", ... }]    │
└─────────────────────────────────────────────────────────────────────┘
                             │
                             ▼
                    User receives response
```

---

## API Gateway Integration (HAProxy)

### How Manifest Configures HAProxy Routes

```csharp
// Platform Core: Smartico.Platform.HAProxyConfigurator

public class HAProxyRouteConfigurator
{
    private readonly IPluginRepository _pluginRepository;
    private readonly IHAProxyConfigGenerator _haproxyGenerator;
    private readonly IKubernetesClient _k8sClient;
    private readonly ILogger<HAProxyRouteConfigurator> _logger;

    /// <summary>
    /// Called during plugin initialization
    /// Reads manifest and configures HAProxy routes
    /// </summary>
    public async Task ConfigureRoutesAsync(
        Plugin plugin,
        PluginManifest manifest)
    {
        _logger.LogInformation($"Configuring HAProxy routes for {manifest.PluginId}");

        // STEP 1: Resolve Kubernetes service endpoint
        var k8sServiceEndpoint = $"{plugin.K8sServiceName}.{plugin.K8sNamespace}.svc.cluster.local";
        var servicePort = await _k8sClient.GetServicePortAsync(
            plugin.K8sNamespace,
            plugin.K8sServiceName
        );

        // STEP 2: Create backend configuration
        var backend = new HAProxyBackend
        {
            Name = $"backend_{manifest.PluginId.Replace(".", "_")}",
            Servers = new List<HAProxyServer>
            {
                new HAProxyServer
                {
                    Name = plugin.K8sServiceName,
                    Address = k8sServiceEndpoint,
                    Port = servicePort,
                    CheckInterval = "5s",
                    HealthCheckPath = manifest.Monitoring.HealthCheck
                }
            },
            Balance = "roundrobin",
            Options = new[]
            {
                "httpchk GET " + manifest.Monitoring.HealthCheck,
                "http-server-close",
                "forwardfor"
            }
        };

        // STEP 3: Configure routes from manifest
        var frontendRules = new List<HAProxyFrontendRule>();

        foreach (var endpoint in manifest.Provides.ApiEndpoints)
        {
            var rule = new HAProxyFrontendRule
            {
                Name = $"rule_{manifest.PluginId}_{endpoint.Method}_{SanitizePath(endpoint.Path)}",
                Conditions = new List<string>()
            };

            // Match path and method
            rule.Conditions.Add($"{{ path_beg {endpoint.Path} }}");
            rule.Conditions.Add($"{{ method {endpoint.Method} }}");

            // STEP 4: Add authentication ACL
            if (endpoint.Auth == "required")
            {
                rule.Conditions.Add("{ req.hdr(Authorization) -m found }");
                rule.Actions.Add("http-request deny unless { req.hdr(Authorization) -m found }");
            }

            // STEP 5: Add rate limiting (using HAProxy stick-tables)
            if (endpoint.RateLimit != null)
            {
                var rateLimitName = $"ratelimit_{manifest.PluginId}_{SanitizePath(endpoint.Path)}";

                // Create stick-table for rate limiting
                backend.StickTable = new HAProxyStickTable
                {
                    Type = "ip",
                    Size = "1m",
                    Expire = endpoint.RateLimit.Window,
                    Store = $"http_req_rate({ParseWindowSeconds(endpoint.RateLimit.Window)})"
                };

                // Add rate limit ACL
                rule.Actions.Add($"http-request track-sc0 src");
                rule.Actions.Add($"http-request deny deny_status 429 if {{ sc_http_req_rate(0) gt {endpoint.RateLimit.Requests} }}");
            }

            // STEP 6: Add caching headers
            if (endpoint.Cache != null && endpoint.Method == "GET")
            {
                rule.Actions.Add($"http-response set-header Cache-Control \"public, max-age={endpoint.Cache.Ttl}\"");
            }

            // STEP 7: Add custom headers
            rule.Actions.Add($"http-request set-header X-Plugin-Id {manifest.PluginId}");
            rule.Actions.Add($"http-request set-header X-Plugin-Version {manifest.Version}");
            rule.Actions.Add("http-request set-header X-Request-Id %[uuid()]");

            // STEP 8: Route to backend
            rule.Actions.Add($"use_backend {backend.Name}");

            frontendRules.Add(rule);
        }

        // STEP 9: Generate HAProxy configuration
        await _haproxyGenerator.AddBackendAsync(backend);
        await _haproxyGenerator.AddFrontendRulesAsync(frontendRules);

        _logger.LogInformation($"✓ HAProxy configured for {manifest.PluginId}");
    }
}
```

### Example HAProxy Configuration Generated from Manifest

```haproxy
#---------------------------------------------------------------------
# HAProxy Configuration - Auto-generated from plugin manifests
# Generated: 2025-01-13 10:30:00 UTC
#---------------------------------------------------------------------

global
    log /dev/log local0
    log /dev/log local1 notice
    chroot /var/lib/haproxy
    stats socket /run/haproxy/admin.sock mode 660 level admin
    stats timeout 30s
    user haproxy
    group haproxy
    daemon

defaults
    log     global
    mode    http
    option  httplog
    option  dontlognull
    timeout connect 5000
    timeout client  50000
    timeout server  50000

#---------------------------------------------------------------------
# Frontend - Main API Gateway
#---------------------------------------------------------------------
frontend api_gateway
    bind *:80
    bind *:443 ssl crt /etc/ssl/certs/smartico.pem

    # Default settings
    option forwardfor
    http-request set-header X-Forwarded-Proto https if { ssl_fc }
    http-request set-header X-Real-IP %[src]

    # CORS headers
    http-response set-header Access-Control-Allow-Origin "*"
    http-response set-header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS"
    http-response set-header Access-Control-Allow-Headers "Authorization, Content-Type"

    # Handle OPTIONS requests
    http-request return status 200 content-type "text/plain" if METH_OPTIONS

    #-----------------------------------------------------------------
    # Plugin: smartico.leaderboards (v1.0.0)
    # Namespace: smartico-leaderboards-prod
    # Service: leaderboards-service
    #-----------------------------------------------------------------

    # ACL for leaderboards routes
    acl is_leaderboards_list path_beg /api/leaderboards
    acl is_leaderboards_get path_beg /api/leaderboards/
    acl is_leaderboards_join path_end /join
    acl method_get method GET
    acl method_post method POST
    acl has_auth_header req.hdr(Authorization) -m found

    # Rate limiting (500 req/min per IP)
    acl is_rate_limited_leaderboards sc_http_req_rate(0) gt 500

    # Authentication check
    http-request deny deny_status 401 if is_leaderboards_list !has_auth_header
    http-request deny deny_status 401 if is_leaderboards_get !has_auth_header

    # Rate limiting
    http-request track-sc0 src table backend_smartico_leaderboards
    http-request deny deny_status 429 if is_rate_limited_leaderboards

    # Add plugin headers
    http-request set-header X-Plugin-Id smartico.leaderboards if is_leaderboards_list
    http-request set-header X-Plugin-Version 1.0.0 if is_leaderboards_list
    http-request set-header X-Request-Id %[uuid()] if is_leaderboards_list

    # Cache control for GET requests
    http-response set-header Cache-Control "public, max-age=60" if is_leaderboards_get method_get

    # Route to backend
    use_backend backend_smartico_leaderboards if is_leaderboards_list
    use_backend backend_smartico_leaderboards if is_leaderboards_get

    #-----------------------------------------------------------------
    # Plugin: smartico.missions (v1.5.0)
    #-----------------------------------------------------------------
    acl is_missions path_beg /api/missions
    use_backend backend_smartico_missions if is_missions

    #-----------------------------------------------------------------
    # Plugin: smartico.bonuses (v2.1.0)
    #-----------------------------------------------------------------
    acl is_bonuses path_beg /api/bonuses
    use_backend backend_smartico_bonuses if is_bonuses

    #-----------------------------------------------------------------
    # Plugin: smartico.tournaments (v1.8.0)
    #-----------------------------------------------------------------
    acl is_tournaments path_beg /api/tournaments
    use_backend backend_smartico_tournaments if is_tournaments

    # Default backend (404)
    default_backend backend_not_found

#---------------------------------------------------------------------
# Backend: smartico.leaderboards
# Kubernetes Service: leaderboards-service.smartico-leaderboards-prod.svc.cluster.local
#---------------------------------------------------------------------
backend backend_smartico_leaderboards
    balance roundrobin
    option httpchk GET /health
    http-check expect status 200

    # Stick table for rate limiting (per IP)
    stick-table type ip size 1m expire 1m store http_req_rate(1m)

    # Kubernetes service endpoint
    server leaderboards-service leaderboards-service.smartico-leaderboards-prod.svc.cluster.local:8080 check inter 5s rise 2 fall 3

#---------------------------------------------------------------------
# Backend: smartico.missions
#---------------------------------------------------------------------
backend backend_smartico_missions
    balance roundrobin
    option httpchk GET /health
    http-check expect status 200

    server missions-service missions-service.smartico-missions-prod.svc.cluster.local:8080 check inter 5s rise 2 fall 3

#---------------------------------------------------------------------
# Backend: smartico.bonuses
#---------------------------------------------------------------------
backend backend_smartico_bonuses
    balance roundrobin
    option httpchk GET /health
    http-check expect status 200

    server bonuses-service bonuses-service.smartico-bonuses-prod.svc.cluster.local:8080 check inter 5s rise 2 fall 3

#---------------------------------------------------------------------
# Backend: smartico.tournaments
#---------------------------------------------------------------------
backend backend_smartico_tournaments
    balance roundrobin
    option httpchk GET /health
    http-check expect status 200

    server tournaments-service tournaments-service.smartico-tournaments-prod.svc.cluster.local:8080 check inter 5s rise 2 fall 3

#---------------------------------------------------------------------
# Backend: Not Found (404)
#---------------------------------------------------------------------
backend backend_not_found
    http-request deny deny_status 404
```

### HAProxy Configuration Reload Process

```
┌─────────────────────────────────────────────────────────────────────┐
│  HAProxy Dynamic Configuration Update                               │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  1. Plugin Registers via Rocketor                                   │
│     POST /api/admin/plugins/register                                │
│     { manifest: {...}, namespace: "...", serviceName: "..." }       │
│                                                                     │
│  2. Platform Generates HAProxy Config                               │
│     ├─ Parse manifest.provides.apiEndpoints                         │
│     ├─ Create backend from k8s service endpoint                     │
│     ├─ Generate ACLs and routing rules                              │
│     └─ Add rate limiting, auth, caching rules                       │
│                                                                     │
│  3. Validate New Configuration                                      │
│     haproxy -f /etc/haproxy/haproxy.cfg.new -c                     │
│     ✓ Configuration file is valid                                   │
│                                                                     │
│  4. Graceful Reload (Zero Downtime)                                 │
│     # Move new config to active location                            │
│     mv /etc/haproxy/haproxy.cfg.new /etc/haproxy/haproxy.cfg       │
│                                                                     │
│     # Soft reload (maintains existing connections)                  │
│     haproxy -f /etc/haproxy/haproxy.cfg -sf $(pidof haproxy)       │
│                                                                     │
│     ✓ HAProxy reloaded with zero downtime                           │
│     ✓ New routes active                                             │
│     ✓ Old connections gracefully drained                            │
│                                                                     │
│  5. Health Check Verification                                       │
│     Check backend health: leaderboards-service                      │
│     GET http://leaderboards-service.smartico-leaderboards-prod.svc.cluster.local:8080/health
│     ✓ Backend healthy and accepting traffic                         │
└─────────────────────────────────────────────────────────────────────┘
```

---

## SignalR Hub Integration

### How Manifest Configures Event Routing

```csharp
// Platform Core: Smartico.Platform.SignalRHub

public class SignalREventConfigurator
{
    private readonly IHubContext<SmarticoHub> _hubContext;
    private readonly IEventRouter _eventRouter;
    private readonly ILogger<SignalREventConfigurator> _logger;

    /// <summary>
    /// Called during plugin initialization
    /// Configures event publishing and subscriptions
    /// </summary>
    public async Task ConfigureEventsAsync(PluginManifest manifest)
    {
        // STEP 1: Register events this plugin PUBLISHES
        foreach (var publishedEvent in manifest.Provides.SignalREvents.Publishes)
        {
            var eventKey = $"{manifest.PluginId}:{publishedEvent.Event}";

            // Register in event catalog
            await _eventRouter.RegisterPublisherAsync(new EventPublisher
            {
                EventKey = eventKey,
                PluginId = manifest.PluginId,
                EventName = publishedEvent.Event,
                Description = publishedEvent.Description,
                PayloadSchema = publishedEvent.Payload
            });

            _logger.LogInformation(
                $"Registered event publisher: {eventKey}"
            );
        }

        // STEP 2: Register events this plugin SUBSCRIBES TO
        foreach (var subscribedEvent in manifest.Provides.SignalREvents.Subscribes)
        {
            var eventKey = $"{subscribedEvent.From}:{subscribedEvent.Event}";

            // Verify publisher exists
            var publisher = await _eventRouter.GetPublisherAsync(eventKey);
            if (publisher == null)
            {
                throw new InvalidOperationException(
                    $"Plugin {manifest.PluginId} subscribes to non-existent event: {eventKey}"
                );
            }

            // Register subscription
            await _eventRouter.RegisterSubscriberAsync(new EventSubscriber
            {
                EventKey = eventKey,
                SubscriberPluginId = manifest.PluginId,
                CallbackUrl = $"http://{manifest.PluginId}-service/webhooks/events/{subscribedEvent.Event}",
                Description = subscribedEvent.Description
            });

            _logger.LogInformation(
                $"Plugin {manifest.PluginId} subscribed to: {eventKey}"
            );
        }
    }
}
```

### Event Routing at Runtime

```
┌─────────────────────────────────────────────────────────────────────┐
│  Leaderboards Service publishes event                               │
├─────────────────────────────────────────────────────────────────────┤
│  await _signalRClient.PublishEventAsync(                            │
│    "LeaderboardRankingUpdated",                                     │
│    new {                                                            │
│      leaderboardId = "lb-123",                                      │
│      userId = "user-456",                                           │
│      newRank = 5,                                                   │
│      previousRank = 8                                               │
│    }                                                                │
│  );                                                                 │
└─────────────────────────────────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│  SignalR Hub (Platform Core)                                        │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  1. Receive Event                                                   │
│     Event: smartico.leaderboards:LeaderboardRankingUpdated          │
│                                                                     │
│  2. Lookup Manifest (from cache)                                    │
│     ├─ Load: smartico.leaderboards manifest                         │
│     ├─ Find: LeaderboardRankingUpdated in publishes[]              │
│     └─ Verify: Payload matches schema                               │
│                                                                     │
│  3. Find Subscribers (from event router)                            │
│     Query: Who subscribes to this event?                            │
│     ├─ smartico.missions (subscribed for mission progress)          │
│     └─ smartico.tournaments (subscribed for tournament updates)     │
│                                                                     │
│  4. Broadcast to Connected Clients                                  │
│     ├─ Find user's connections: user-456 has 2 connections          │
│     ├─ Send to group: operator:lucky-casino:user:user-456           │
│     └─ Clients receive update in real-time                          │
│                                                                     │
│  5. Notify Subscriber Plugins                                       │
│     ├─ POST http://missions-service/webhooks/events/LeaderboardRankingUpdated
│     │  Body: { leaderboardId: "lb-123", userId: "user-456", ... }  │
│     │  Response: 200 OK                                             │
│     │                                                               │
│     └─ POST http://tournaments-service/webhooks/events/LeaderboardRankingUpdated
│        Body: { leaderboardId: "lb-123", userId: "user-456", ... }  │
│        Response: 200 OK                                             │
└─────────────────────────────────────────────────────────────────────┘
```

### Manifest-Driven Event Validation

```csharp
// Platform Core: Event payload validation

public class EventValidator
{
    /// <summary>
    /// Validates event payload against manifest schema
    /// </summary>
    public ValidationResult ValidateEvent(
        PluginManifest manifest,
        string eventName,
        object payload)
    {
        // Find event definition in manifest
        var eventDef = manifest.Provides.SignalREvents.Publishes
            .FirstOrDefault(e => e.Event == eventName);

        if (eventDef == null)
        {
            return ValidationResult.Failed(
                $"Event {eventName} not declared in manifest"
            );
        }

        // Validate payload structure
        var payloadJson = JsonSerializer.Serialize(payload);
        var payloadObj = JsonDocument.Parse(payloadJson);

        // Check required fields from manifest
        foreach (var field in eventDef.Payload)
        {
            if (!payloadObj.RootElement.TryGetProperty(field.Key, out var value))
            {
                return ValidationResult.Failed(
                    $"Missing required field: {field.Key}"
                );
            }

            // Type checking
            var expectedType = field.Value.ToString().ToLower();
            var actualType = value.ValueKind.ToString().ToLower();

            if (!TypesMatch(expectedType, actualType))
            {
                return ValidationResult.Failed(
                    $"Type mismatch for {field.Key}: expected {expectedType}, got {actualType}"
                );
            }
        }

        return ValidationResult.Success();
    }
}
```

---

## UI Shell Integration

### How Manifest Configures Dashboard

```
┌─────────────────────────────────────────────────────────────────────┐
│  Platform UI Shell Initialization                                   │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  1. Load All Active Plugin Manifests                                │
│     GET /api/admin/plugins?status=active                            │
│     Response: [6 plugin manifests]                                  │
│                                                                     │
│  2. Extract UI Components                                           │
│     For each manifest.provides.uiComponent:                         │
│     ├─ smartico.missions                                            │
│     │  └─ { type: "tab", title: "Missions", route: "/missions" }   │
│     ├─ smartico.bonuses                                             │
│     │  └─ { type: "tab", title: "Bonuses", route: "/bonuses" }     │
│     ├─ smartico.leaderboards                                        │
│     │  └─ { type: "tab", title: "Leaderboards", route: "/leaderboards" }
│     └─ ... other plugins                                            │
│                                                                     │
│  3. Sort by Order                                                   │
│     Sort by manifest.provides.uiComponent.order:                    │
│     ├─ 10: Missions                                                 │
│     ├─ 20: Bonuses                                                  │
│     ├─ 30: Tournaments                                              │
│     ├─ 40: Leaderboards                                             │
│     └─ 50: Profiles                                                 │
│                                                                     │
│  4. Check Operator Configuration                                    │
│     GET /api/operators/lucky-casino/configuration                   │
│     Response: {                                                     │
│       enabledFeatures: [                                            │
│         "smartico.missions",                                        │
│         "smartico.bonuses",                                         │
│         "smartico.leaderboards",                                    │
│         "smartico.profiles"                                         │
│       ]                                                             │
│     }                                                               │
│                                                                     │
│  5. Filter Disabled Features                                        │
│     Remove: smartico.tournaments (not in enabledFeatures)           │
│                                                                     │
│  6. Generate Navigation                                             │
│     Dashboard Tabs:                                                 │
│     ┌──────────┬──────────┬──────────────┬──────────┐             │
│     │ Missions │ Bonuses  │ Leaderboards │ Profiles │             │
│     └──────────┴──────────┴──────────────┴──────────┘             │
│                                                                     │
│  7. Setup Lazy Loading Routes                                       │
│     For each tab (if manifest.uiComponent.lazy = true):            │
│     ├─ /missions → load @smartico/missions-ui bundle               │
│     ├─ /bonuses → load @smartico/bonuses-ui bundle                 │
│     ├─ /leaderboards → load @smartico/leaderboards-ui bundle       │
│     └─ /profiles → load @smartico/profiles-ui bundle               │
└─────────────────────────────────────────────────────────────────────┘
```

### Dynamic Route Configuration

```typescript
// Frontend: Smartico Dashboard Shell (React)

import React, { useEffect, useState } from 'react';
import { Routes, Route } from 'react-router-dom';

interface PluginManifest {
  pluginId: string;
  pluginName: string;
  provides: {
    uiComponent: {
      type: 'tab' | 'modal' | 'widget';
      title: string;
      icon: string;
      route: string;
      lazy: boolean;
      order: number;
      permissions: string[];
    };
  };
}

export const DashboardShell: React.FC = () => {
  const [plugins, setPlugins] = useState<PluginManifest[]>([]);
  const [routes, setRoutes] = useState<any[]>([]);

  useEffect(() => {
    // STEP 1: Fetch active plugin manifests
    fetch('/api/admin/plugins?status=active')
      .then(res => res.json())
      .then(async (manifests: PluginManifest[]) => {

        // STEP 2: Get operator configuration
        const operatorId = getCurrentOperatorId();
        const config = await fetch(`/api/operators/${operatorId}/configuration`)
          .then(res => res.json());

        // STEP 3: Filter by enabled features
        const enabledPlugins = manifests.filter(m =>
          config.enabledFeatures.includes(m.pluginId)
        );

        // STEP 4: Sort by order
        enabledPlugins.sort((a, b) =>
          a.provides.uiComponent.order - b.provides.uiComponent.order
        );

        setPlugins(enabledPlugins);

        // STEP 5: Setup dynamic routes
        const dynamicRoutes = enabledPlugins.map(plugin => {
          const componentPath = plugin.provides.uiComponent.route;

          if (plugin.provides.uiComponent.lazy) {
            // Lazy load component
            const Component = React.lazy(() =>
              import(`@smartico/${plugin.pluginId}-ui`)
            );

            return {
              path: componentPath,
              element: (
                <React.Suspense fallback={<LoadingSpinner />}>
                  <Component />
                </React.Suspense>
              )
            };
          } else {
            // Static import (already bundled)
            return {
              path: componentPath,
              element: <StaticComponent pluginId={plugin.pluginId} />
            };
          }
        });

        setRoutes(dynamicRoutes);
      });
  }, []);

  return (
    <div className="dashboard-shell">
      {/* Navigation Tabs - generated from manifests */}
      <nav className="dashboard-nav">
        {plugins.map(plugin => (
          <NavTab
            key={plugin.pluginId}
            icon={plugin.provides.uiComponent.icon}
            title={plugin.provides.uiComponent.title}
            route={plugin.provides.uiComponent.route}
          />
        ))}
      </nav>

      {/* Dynamic Routes - loaded from manifests */}
      <main className="dashboard-content">
        <Routes>
          {routes.map((route, index) => (
            <Route
              key={index}
              path={route.path}
              element={route.element}
            />
          ))}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
    </div>
  );
};
```

---

## Configuration Management

### How Manifest Defines Configuration Schema

```json
// From leaderboards plugin.manifest.json
{
  "configuration": {
    "schema": {
      "maxActiveLeaderboards": {
        "type": "number",
        "default": 10,
        "min": 1,
        "max": 100,
        "description": "Maximum concurrent leaderboards"
      },
      "rankingUpdateInterval": {
        "type": "number",
        "default": 300,
        "description": "Ranking recalculation interval (seconds)"
      },
      "enableRealTimeUpdates": {
        "type": "boolean",
        "default": true,
        "description": "Push live ranking updates via SignalR"
      }
    },
    "defaults": {
      "maxActiveLeaderboards": 10,
      "rankingUpdateInterval": 300,
      "enableRealTimeUpdates": true
    }
  }
}
```

### Configuration at Multiple Levels

```
┌─────────────────────────────────────────────────────────────────────┐
│  Configuration Hierarchy (Least → Most Specific)                    │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  Level 1: Manifest Defaults (from plugin.manifest.json)            │
│  {                                                                  │
│    "maxActiveLeaderboards": 10,                                     │
│    "rankingUpdateInterval": 300,                                    │
│    "enableRealTimeUpdates": true                                    │
│  }                                                                  │
│                                                                     │
│  Level 2: Platform-Wide Config (applied to all operators)          │
│  {                                                                  │
│    "rankingUpdateInterval": 600  // Platform admin changed this    │
│  }                                                                  │
│                                                                     │
│  Level 3: Operator-Specific Config (per brand)                     │
│  Operator: "lucky-casino"                                           │
│  {                                                                  │
│    "maxActiveLeaderboards": 25,  // Upgraded to premium            │
│    "enableRealTimeUpdates": true                                    │
│  }                                                                  │
│                                                                     │
│  Merged Result for "lucky-casino":                                 │
│  {                                                                  │
│    "maxActiveLeaderboards": 25,        // From Level 3             │
│    "rankingUpdateInterval": 600,       // From Level 2             │
│    "enableRealTimeUpdates": true       // From Level 1 (default)   │
│  }                                                                  │
└─────────────────────────────────────────────────────────────────────┘
```

### Configuration Service

```csharp
// Platform Core: Smartico.Platform.Configuration

public class PluginConfigurationService
{
    private readonly IPluginRepository _pluginRepository;
    private readonly IConfigurationRepository _configurationRepository;
    private readonly ICache _cache;

    /// <summary>
    /// Get merged configuration for a plugin for a specific operator
    /// Uses manifest schema for validation
    /// </summary>
    public async Task<Dictionary<string, object>> GetConfigurationAsync(
        string pluginId,
        string operatorId)
    {
        var cacheKey = $"config:{pluginId}:{operatorId}";

        // Check cache
        if (_cache.TryGet(cacheKey, out Dictionary<string, object> cached))
        {
            return cached;
        }

        // STEP 1: Load manifest (for schema and defaults)
        var plugin = await _pluginRepository.GetPluginAsync(pluginId);
        var manifest = JsonSerializer.Deserialize<PluginManifest>(plugin.ManifestJson);

        // STEP 2: Start with manifest defaults
        var config = new Dictionary<string, object>(manifest.Configuration.Defaults);

        // STEP 3: Apply platform-wide config
        var platformConfig = await _configurationRepository
            .GetPlatformConfigAsync(pluginId);

        foreach (var kvp in platformConfig)
        {
            config[kvp.Key] = kvp.Value;
        }

        // STEP 4: Apply operator-specific config
        var operatorConfig = await _configurationRepository
            .GetOperatorConfigAsync(pluginId, operatorId);

        foreach (var kvp in operatorConfig)
        {
            config[kvp.Key] = kvp.Value;
        }

        // STEP 5: Validate against schema
        var validationResult = ValidateConfiguration(manifest.Configuration.Schema, config);
        if (!validationResult.IsValid)
        {
            throw new InvalidConfigurationException(
                $"Configuration for {pluginId} is invalid: {validationResult.Errors}"
            );
        }

        // STEP 6: Cache result
        _cache.Set(cacheKey, config, TimeSpan.FromMinutes(5));

        return config;
    }

    /// <summary>
    /// Validates configuration against manifest schema
    /// </summary>
    private ValidationResult ValidateConfiguration(
        Dictionary<string, ConfigSchema> schema,
        Dictionary<string, object> config)
    {
        var errors = new List<string>();

        foreach (var kvp in schema)
        {
            var key = kvp.Key;
            var schemaEntry = kvp.Value;

            if (!config.ContainsKey(key))
            {
                errors.Add($"Missing required configuration: {key}");
                continue;
            }

            var value = config[key];

            // Type validation
            if (schemaEntry.Type == "number" && value is not int && value is not double)
            {
                errors.Add($"{key} must be a number");
            }
            else if (schemaEntry.Type == "boolean" && value is not bool)
            {
                errors.Add($"{key} must be a boolean");
            }
            else if (schemaEntry.Type == "string" && value is not string)
            {
                errors.Add($"{key} must be a string");
            }

            // Range validation for numbers
            if (schemaEntry.Type == "number")
            {
                var numValue = Convert.ToDouble(value);

                if (schemaEntry.Min.HasValue && numValue < schemaEntry.Min.Value)
                {
                    errors.Add($"{key} must be at least {schemaEntry.Min}");
                }

                if (schemaEntry.Max.HasValue && numValue > schemaEntry.Max.Value)
                {
                    errors.Add($"{key} must be at most {schemaEntry.Max}");
                }
            }
        }

        return errors.Any()
            ? ValidationResult.Failed(errors)
            : ValidationResult.Success();
    }
}
```

### Plugin Receives Configuration

```csharp
// Leaderboards Service

public class LeaderboardsController : ControllerBase
{
    private readonly IPluginConfigurationClient _configClient;

    [HttpPost("leaderboards")]
    public async Task<IActionResult> CreateLeaderboard([FromBody] CreateLeaderboardRequest request)
    {
        // Get operator ID from JWT
        var operatorId = User.FindFirst("operatorId").Value;

        // STEP 1: Fetch configuration (uses manifest schema)
        var config = await _configClient.GetConfigurationAsync(
            "smartico.leaderboards",
            operatorId
        );

        // STEP 2: Use configuration values
        var maxAllowed = (int)config["maxActiveLeaderboards"];
        var currentCount = await _repository.GetActiveLeaderboardCountAsync(operatorId);

        if (currentCount >= maxAllowed)
        {
            return BadRequest(new
            {
                error = $"Maximum active leaderboards reached ({maxAllowed})"
            });
        }

        // Continue creating leaderboard...
    }
}
```

---

## Monitoring & Health Checks

### How Manifest Configures Monitoring

```json
// From leaderboards plugin.manifest.json
{
  "monitoring": {
    "healthCheck": "/health",
    "readinessCheck": "/ready",
    "metricsEndpoint": "/metrics",
    "sla": {
      "uptime": 99.9,
      "latencyP95": 200,
      "errorRate": 0.1
    }
  }
}
```

### Health Check Orchestration

```csharp
// Platform Core: Health Check Service

public class PluginHealthMonitor : BackgroundService
{
    private readonly IPluginRepository _pluginRepository;
    private readonly IHttpClientFactory _httpClientFactory;
    private readonly IMetricsPublisher _metricsPublisher;
    private readonly IAlertingService _alertingService;

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        while (!stoppingToken.IsCancellationRequested)
        {
            // STEP 1: Load all active plugins
            var plugins = await _pluginRepository.GetActivePluginsAsync();

            foreach (var plugin in plugins)
            {
                var manifest = JsonSerializer.Deserialize<PluginManifest>(plugin.ManifestJson);

                try
                {
                    // STEP 2: Perform health check (from manifest)
                    var healthUrl = $"http://{plugin.ServiceName}{manifest.Monitoring.HealthCheck}";
                    var health = await CheckHealthAsync(healthUrl);

                    // STEP 3: Check readiness (from manifest)
                    var readinessUrl = $"http://{plugin.ServiceName}{manifest.Monitoring.ReadinessCheck}";
                    var readiness = await CheckReadinessAsync(readinessUrl);

                    // STEP 4: Fetch metrics (from manifest)
                    var metricsUrl = $"http://{plugin.ServiceName}{manifest.Monitoring.MetricsEndpoint}";
                    var metrics = await FetchMetricsAsync(metricsUrl);

                    // STEP 5: Compare against SLA (from manifest)
                    var slaViolations = CheckSLACompliance(manifest.Monitoring.Sla, metrics);

                    if (slaViolations.Any())
                    {
                        // Alert on SLA violation
                        await _alertingService.SendAlertAsync(new Alert
                        {
                            Severity = AlertSeverity.Warning,
                            PluginId = manifest.PluginId,
                            Message = $"SLA violations detected: {string.Join(", ", slaViolations)}"
                        });
                    }

                    // STEP 6: Publish metrics
                    await _metricsPublisher.PublishAsync(new PluginMetrics
                    {
                        PluginId = manifest.PluginId,
                        IsHealthy = health.IsHealthy,
                        IsReady = readiness.IsReady,
                        Uptime = metrics.Uptime,
                        LatencyP95 = metrics.LatencyP95,
                        ErrorRate = metrics.ErrorRate,
                        Timestamp = DateTime.UtcNow
                    });
                }
                catch (Exception ex)
                {
                    // Plugin unreachable
                    await _alertingService.SendAlertAsync(new Alert
                    {
                        Severity = AlertSeverity.Critical,
                        PluginId = manifest.PluginId,
                        Message = $"Plugin health check failed: {ex.Message}"
                    });
                }
            }

            // Check every 30 seconds
            await Task.Delay(TimeSpan.FromSeconds(30), stoppingToken);
        }
    }

    private List<string> CheckSLACompliance(SlaConfig sla, PluginMetrics metrics)
    {
        var violations = new List<string>();

        // Check uptime
        if (metrics.Uptime < sla.Uptime)
        {
            violations.Add($"Uptime {metrics.Uptime}% < SLA {sla.Uptime}%");
        }

        // Check latency
        if (metrics.LatencyP95 > sla.LatencyP95)
        {
            violations.Add($"Latency p95 {metrics.LatencyP95}ms > SLA {sla.LatencyP95}ms");
        }

        // Check error rate
        if (metrics.ErrorRate > sla.ErrorRate)
        {
            violations.Add($"Error rate {metrics.ErrorRate}% > SLA {sla.ErrorRate}%");
        }

        return violations;
    }
}
```

---

## Deployment & Versioning

### How Manifest Enables Blue-Green Deployment

```
┌─────────────────────────────────────────────────────────────────────┐
│  Deploying New Version: smartico.leaderboards v1.1.0               │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  Current State:                                                     │
│  ├─ v1.0.0 (100% traffic) - BLUE                                    │
│  └─ Status: Active                                                  │
│                                                                     │
│  Step 1: Deploy v1.1.0 alongside v1.0.0                            │
│  ├─ v1.0.0 (100% traffic) - BLUE                                    │
│  └─ v1.1.0 (0% traffic) - GREEN                                     │
│                                                                     │
│  Step 2: Register v1.1.0 manifest                                   │
│  POST /api/admin/plugins/register                                   │
│  {                                                                  │
│    pluginId: "smartico.leaderboards",                               │
│    version: "1.1.0",                                                │
│    manifest: { ... },                                               │
│    dockerImage: "smartico.azurecr.io/leaderboards:1.1.0"            │
│  }                                                                  │
│                                                                     │
│  Step 3: Health check v1.1.0                                        │
│  GET http://leaderboards-v1-1-0-service/health                      │
│  ✓ Healthy                                                          │
│                                                                     │
│  Step 4: Gradual traffic shift                                      │
│  ├─ v1.0.0 (90% traffic) - BLUE                                     │
│  └─ v1.1.0 (10% traffic) - GREEN ← Monitor for errors              │
│                                                                     │
│  Step 5: Monitor metrics (from manifest SLA)                        │
│  ├─ Latency: 180ms (within SLA: 200ms) ✓                           │
│  ├─ Error rate: 0.05% (within SLA: 0.1%) ✓                         │
│  └─ No alerts triggered                                             │
│                                                                     │
│  Step 6: Continue traffic shift                                     │
│  ├─ v1.0.0 (50% traffic) - BLUE                                     │
│  └─ v1.1.0 (50% traffic) - GREEN                                    │
│                                                                     │
│  Step 7: Complete cutover                                           │
│  ├─ v1.0.0 (0% traffic) - BLUE (kept for rollback)                 │
│  └─ v1.1.0 (100% traffic) - GREEN                                   │
│                                                                     │
│  Step 8: Update active version in registry                          │
│  UPDATE plugin_registry                                             │
│  SET status = 'deprecated'                                          │
│  WHERE plugin_id = 'smartico.leaderboards' AND version = '1.0.0';   │
│                                                                     │
│  UPDATE plugin_registry                                             │
│  SET status = 'active'                                              │
│  WHERE plugin_id = 'smartico.leaderboards' AND version = '1.1.0';   │
│                                                                     │
│  Step 9: Decommission v1.0.0 (after 24 hours)                      │
│  kubectl delete deployment leaderboards-v1-0-0                      │
└─────────────────────────────────────────────────────────────────────┘
```

### Manifest Versioning & Compatibility

```csharp
// Platform Core: Version compatibility checker

public class ManifestVersionChecker
{
    /// <summary>
    /// Check if new manifest version is compatible with platform
    /// </summary>
    public CompatibilityResult CheckCompatibility(
        PluginManifest oldManifest,
        PluginManifest newManifest)
    {
        var issues = new List<string>();

        // RULE 1: API endpoints cannot be removed (breaking change)
        var removedEndpoints = oldManifest.Provides.ApiEndpoints
            .Where(old => !newManifest.Provides.ApiEndpoints
                .Any(new => new.Path == old.Path && new.Method == old.Method))
            .ToList();

        if (removedEndpoints.Any())
        {
            issues.Add($"Breaking: Removed API endpoints: {string.Join(", ", removedEndpoints.Select(e => $"{e.Method} {e.Path}"))}");
        }

        // RULE 2: SignalR events cannot be removed (breaking change)
        var removedEvents = oldManifest.Provides.SignalREvents.Publishes
            .Where(old => !newManifest.Provides.SignalREvents.Publishes
                .Any(new => new.Event == old.Event))
            .ToList();

        if (removedEvents.Any())
        {
            issues.Add($"Breaking: Removed SignalR events: {string.Join(", ", removedEvents.Select(e => e.Event))}");
        }

        // RULE 3: Configuration schema cannot remove required fields
        var removedConfigKeys = oldManifest.Configuration.Schema.Keys
            .Where(key => !newManifest.Configuration.Schema.ContainsKey(key))
            .ToList();

        if (removedConfigKeys.Any())
        {
            issues.Add($"Breaking: Removed configuration keys: {string.Join(", ", removedConfigKeys)}");
        }

        // RULE 4: Platform version must be compatible
        if (!IsVersionCompatible(
            newManifest.MinPlatformVersion,
            GetCurrentPlatformVersion()))
        {
            issues.Add($"Incompatible: Plugin requires platform v{newManifest.MinPlatformVersion}, current is v{GetCurrentPlatformVersion()}");
        }

        return issues.Any()
            ? CompatibilityResult.Incompatible(issues)
            : CompatibilityResult.Compatible();
    }
}
```

---

## Complete Code Examples

### Example 1: Plugin Startup Using Manifest

```csharp
// Leaderboards Service: Program.cs

public class Program
{
    public static async Task Main(string[] args)
    {
        var builder = WebApplication.CreateBuilder(args);

        // STEP 1: Load plugin manifest
        var manifestPath = Path.Combine(AppContext.BaseDirectory, "plugin.manifest.json");
        var manifestJson = await File.ReadAllTextAsync(manifestPath);
        var manifest = JsonSerializer.Deserialize<PluginManifest>(manifestJson);

        Console.WriteLine($"Starting plugin: {manifest.PluginName} v{manifest.Version}");

        // STEP 2: Register with platform (self-registration)
        var platformClient = new SmarticoPlatformClient(
            builder.Configuration["Platform:ApiEndpoint"],
            builder.Configuration["Platform:ApiKey"]
        );

        await platformClient.RegisterPluginAsync(manifest);

        // STEP 3: Configure services based on manifest
        builder.Services.AddSingleton(manifest);

        // Add controllers (API endpoints declared in manifest)
        builder.Services.AddControllers();

        // Add SignalR client (for events in manifest)
        builder.Services.AddSignalRClient(options =>
        {
            options.HubUrl = builder.Configuration["Platform:SignalRHub"];
            options.PluginId = manifest.PluginId;

            // Register event publishers from manifest
            foreach (var eventDef in manifest.Provides.SignalREvents.Publishes)
            {
                options.RegisterPublisher(eventDef.Event);
            }

            // Register event subscribers from manifest
            foreach (var eventDef in manifest.Provides.SignalREvents.Subscribes)
            {
                options.RegisterSubscriber(eventDef.Event, eventDef.From);
            }
        });

        // Add health checks (endpoints from manifest)
        builder.Services.AddHealthChecks()
            .AddCheck<DatabaseHealthCheck>("database")
            .AddCheck<RedisHealthCheck>("redis");

        // Add monitoring (metrics endpoint from manifest)
        builder.Services.AddPrometheusMetrics(options =>
        {
            options.Endpoint = manifest.Monitoring.MetricsEndpoint;
        });

        var app = builder.Build();

        // STEP 4: Configure middleware
        app.UseRouting();
        app.UseAuthentication();
        app.UseAuthorization();

        app.MapControllers();

        // Map health check endpoint (from manifest)
        app.MapHealthChecks(manifest.Monitoring.HealthCheck);

        // Map readiness check endpoint (from manifest)
        app.MapHealthChecks(manifest.Monitoring.ReadinessCheck, new HealthCheckOptions
        {
            Predicate = check => check.Tags.Contains("ready")
        });

        // Map metrics endpoint (from manifest)
        app.MapMetrics(manifest.Monitoring.MetricsEndpoint);

        Console.WriteLine($"✓ Plugin {manifest.PluginId} started successfully");

        await app.RunAsync();
    }
}
```

### Example 2: API Gateway Request Routing

```csharp
// Platform Core: API Gateway Request Handler

public class ManifestDrivenRequestHandler
{
    private readonly IPluginRepository _pluginRepository;
    private readonly IHttpClientFactory _httpClientFactory;
    private readonly IRateLimiter _rateLimiter;
    private readonly ICacheManager _cacheManager;

    public async Task<HttpResponseMessage> HandleRequestAsync(HttpContext context)
    {
        var method = context.Request.Method;
        var path = context.Request.Path.Value;

        // STEP 1: Find matching route from manifests
        var route = await FindRouteAsync(method, path);
        if (route == null)
        {
            return new HttpResponseMessage(HttpStatusCode.NotFound);
        }

        var manifest = route.Manifest;
        var endpoint = route.Endpoint;

        // STEP 2: Authentication (from manifest)
        if (endpoint.Auth == "required")
        {
            var authResult = await AuthenticateRequestAsync(context);
            if (!authResult.IsAuthenticated)
            {
                return new HttpResponseMessage(HttpStatusCode.Unauthorized);
            }

            context.Items["operatorId"] = authResult.OperatorId;
        }

        // STEP 3: Rate limiting (from manifest)
        if (endpoint.RateLimit != null)
        {
            var operatorId = context.Items["operatorId"]?.ToString();
            var rateLimitKey = $"{operatorId}:{manifest.PluginId}:{path}";

            var isAllowed = await _rateLimiter.CheckAsync(
                rateLimitKey,
                endpoint.RateLimit.Requests,
                ParseDuration(endpoint.RateLimit.Window)
            );

            if (!isAllowed)
            {
                return new HttpResponseMessage(HttpStatusCode.TooManyRequests);
            }
        }

        // STEP 4: Cache check (from manifest)
        if (endpoint.Cache != null && method == "GET")
        {
            var cacheKey = BuildCacheKey(manifest.PluginId, path, endpoint.Cache.VaryBy, context);

            var cachedResponse = await _cacheManager.GetAsync(cacheKey);
            if (cachedResponse != null)
            {
                return cachedResponse;
            }
        }

        // STEP 5: Forward to plugin service
        var targetUrl = $"http://{route.ServiceName}{path}{context.Request.QueryString}";

        var client = _httpClientFactory.CreateClient();
        var request = new HttpRequestMessage(new HttpMethod(method), targetUrl);

        // Copy headers
        foreach (var header in context.Request.Headers)
        {
            request.Headers.TryAddWithoutValidation(header.Key, header.Value.ToArray());
        }

        // Add platform headers
        request.Headers.Add("X-Operator-Id", context.Items["operatorId"]?.ToString());
        request.Headers.Add("X-Plugin-Id", manifest.PluginId);
        request.Headers.Add("X-Request-Id", Guid.NewGuid().ToString());

        // Forward body
        if (context.Request.ContentLength > 0)
        {
            var body = await new StreamReader(context.Request.Body).ReadToEndAsync();
            request.Content = new StringContent(body, Encoding.UTF8, "application/json");
        }

        // STEP 6: Send request
        var response = await client.SendAsync(request);

        // STEP 7: Cache response (if configured)
        if (endpoint.Cache != null && method == "GET" && response.IsSuccessStatusCode)
        {
            var cacheKey = BuildCacheKey(manifest.PluginId, path, endpoint.Cache.VaryBy, context);
            await _cacheManager.SetAsync(
                cacheKey,
                response,
                TimeSpan.FromSeconds(endpoint.Cache.Ttl)
            );
        }

        return response;
    }

    private async Task<RouteMatch> FindRouteAsync(string method, string path)
    {
        // Query all active plugins
        var plugins = await _pluginRepository.GetActivePluginsAsync();

        foreach (var plugin in plugins)
        {
            var manifest = JsonSerializer.Deserialize<PluginManifest>(plugin.ManifestJson);

            foreach (var endpoint in manifest.Provides.ApiEndpoints)
            {
                // Simple path matching (in production, use proper route matching)
                if (endpoint.Method == method && PathMatches(endpoint.Path, path))
                {
                    return new RouteMatch
                    {
                        Manifest = manifest,
                        Endpoint = endpoint,
                        ServiceName = plugin.ServiceName
                    };
                }
            }
        }

        return null;
    }
}
```

---

## Summary: Manifest Throughout Lifecycle

| **Phase** | **How Manifest is Used** |
|-----------|--------------------------|
| **Discovery** | CI/CD extracts manifest from Docker image and registers with platform |
| **Registration** | Platform validates schema, checks dependencies, verifies route uniqueness |
| **Initialization** | Platform configures API routes, SignalR events, UI components from manifest |
| **API Routing** | Gateway reads endpoint config (auth, rate limits, caching) from manifest |
| **SignalR Events** | Hub routes events between publishers/subscribers declared in manifest |
| **UI Shell** | Dashboard generates navigation tabs and routes from manifest |
| **Configuration** | Platform validates operator config against manifest schema |
| **Monitoring** | Health checks and metrics collected from endpoints specified in manifest |
| **Deployment** | Blue-green deployment uses manifest to verify compatibility |
| **Runtime** | All requests validated and routed based on manifest declarations |

---

*The plugin.manifest.json is the single source of truth that drives the entire platform's plugin ecosystem.*

*Last Updated: November 13, 2025*
*Version: 1.0*
