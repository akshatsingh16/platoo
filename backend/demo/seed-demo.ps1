# Loads demo data into the local Plato database.
# Usage (from repo root):  powershell -ExecutionPolicy Bypass -File backend\demo\seed-demo.ps1
# Defaults match application-local.yml; override with -DbHost/-Port/-Db/-User/-Password.
param(
    [string]$DbHost   = "localhost",
    [string]$Port     = "5432",
    [string]$Db       = "plato_db",
    [string]$User     = "postgres",
    [string]$Password = "postgres",
    [string]$Psql     = ""
)

$ErrorActionPreference = "Stop"

if (-not $Psql) {
    $cmd = Get-Command psql -ErrorAction SilentlyContinue
    if ($cmd) { $Psql = $cmd.Source }
    else {
        $Psql = Get-ChildItem "C:\Program Files\PostgreSQL\*\bin\psql.exe" -ErrorAction SilentlyContinue |
                Sort-Object FullName -Descending | Select-Object -First 1 -ExpandProperty FullName
    }
}
if (-not $Psql) { throw "psql not found. Pass -Psql <path-to-psql.exe>." }

$env:PGPASSWORD = $Password
$env:PGCLIENTENCODING = "UTF8"
& $Psql -h $DbHost -p $Port -U $User -d $Db -v ON_ERROR_STOP=1 -f (Join-Path $PSScriptRoot "demo_seed.sql")
if ($LASTEXITCODE -ne 0) { throw "Demo seed failed (exit $LASTEXITCODE)." }
Write-Host "`nDemo data loaded. Log in at http://localhost:3000/login as admin@plato.com" -ForegroundColor Green
