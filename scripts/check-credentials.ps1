# Pulsyn Credential Checker (PowerShell)
# Checks which cloud credentials are configured

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "  PULSYN CREDENTIAL CHECKER" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

# Load .env if exists
if (Test-Path .env) {
    Get-Content .env | Where-Object { $_ -notmatch '^#' -and $_ -match '=' } | ForEach-Object {
        $parts = $_ -split '=', 2
        [Environment]::SetEnvironmentVariable($parts[0].Trim(), $parts[1].Trim(), "Process")
    }
}

function Check-Cred($name, $var) {
    $value = [Environment]::GetEnvironmentVariable($var, "Process")
    if ($value) {
        Write-Host "  ✅ $name" -ForegroundColor Green
        return $true
    } else {
        Write-Host "  ❌ $name (Missing: $var)" -ForegroundColor Red
        return $false
    }
}

$configured = 0
$missing = 0

Write-Host "=== DATABASE ===" -ForegroundColor Yellow
if (Check-Cred "PostgreSQL" "PG_CONNECTION_STRING") { $configured++ } else { $missing++ }
if (Check-Cred "MySQL" "MYSQL_CONNECTION_STRING") { $configured++ } else { $missing++ }
if (Check-Cred "MongoDB" "MONGODB_CONNECTION_STRING") { $configured++ } else { $missing++ }
if (Check-Cred "Redis" "REDIS_CONNECTION_STRING") { $configured++ } else { $missing++ }

Write-Host ""
Write-Host "=== AWS ===" -ForegroundColor Yellow
if (Check-Cred "AWS Access Key" "AWS_ACCESS_KEY_ID") { $configured++ } else { $missing++ }
if (Check-Cred "AWS Secret Key" "AWS_SECRET_ACCESS_KEY") { $configured++ } else { $missing++ }

Write-Host ""
Write-Host "=== STREAMING ===" -ForegroundColor Yellow
if (Check-Cred "Kafka" "KAFKA_BOOTSTRAP_SERVERS") { $configured++ } else { $missing++ }
if (Check-Cred "Elasticsearch" "ELASTICSEARCH_URL") { $configured++ } else { $missing++ }

Write-Host ""
Write-Host "=== SAAS ===" -ForegroundColor Yellow
if (Check-Cred "GitHub" "GITHUB_TOKEN") { $configured++ } else { $missing++ }
if (Check-Cred "Stripe" "STRIPE_SECRET_KEY") { $configured++ } else { $missing++ }

Write-Host ""
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "  SUMMARY" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "  Configured: $configured" -ForegroundColor Green
Write-Host "  Missing: $missing" -ForegroundColor Red
Write-Host ""

if ($missing -eq 0) {
    Write-Host "✅ All credentials configured! Run tests with:" -ForegroundColor Green
    Write-Host "   cd packages/core; npx vitest run src/__tests__/lab/connectors/"
} else {
    Write-Host "⚠️  $missing credentials missing." -ForegroundColor Yellow
    Write-Host "   See docs/CREDENTIAL_SETUP.md for setup instructions."
    Write-Host ""
    Write-Host "   Quick start (free tier):" -ForegroundColor Cyan
    Write-Host "   1. MongoDB Atlas: https://www.mongodb.com/atlas"
    Write-Host "   2. Upstash Redis: https://upstash.com"
    Write-Host "   3. Confluent Kafka: https://www.confluent.io/confluent-cloud/"
    Write-Host "   4. AWS Free Tier: https://aws.amazon.com/free"
    Write-Host "   5. Stripe Test Mode: https://dashboard.stripe.com"
    Write-Host "   6. GitHub Token: https://github.com/settings/tokens"
}
