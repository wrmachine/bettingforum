# Add your current IP to the EC2 security group's SSH rule
# Run this before SSH:  .\scripts\allow-ssh-from-my-ip.ps1
# Requires: AWS CLI configured (aws configure)

param(
  [Parameter(Mandatory=$true)]
  [string]$InstanceId
)

$ErrorActionPreference = "Stop"

Write-Host "Getting your public IP..." -ForegroundColor Cyan
$myIp = (Invoke-WebRequest -Uri "https://checkip.amazonaws.com" -UseBasicParsing).Content.Trim()
$cidr = "$myIp/32"
Write-Host "Your IP: $myIp" -ForegroundColor Green

Write-Host "`nLooking up security group for instance $InstanceId..." -ForegroundColor Cyan
$sgIds = aws ec2 describe-instances --instance-ids $InstanceId --query "Reservations[0].Instances[0].SecurityGroups[*].GroupId" --output text 2>$null
if (-not $sgIds) {
  Write-Host "Failed to get security group. Check instance ID and AWS CLI (aws configure)." -ForegroundColor Red
  exit 1
}

foreach ($sgId in $sgIds.Split()) {
  $sgId = $sgId.Trim()
  if (-not $sgId) { continue }
  Write-Host "Adding SSH rule to security group $sgId..." -ForegroundColor Cyan
  aws ec2 authorize-security-group-ingress --group-id $sgId --protocol tcp --port 22 --cidr $cidr 2>$null
  if ($LASTEXITCODE -eq 0) {
    Write-Host "Done. You can now SSH in:" -ForegroundColor Green
    Write-Host "  ssh -i `"betting.forum.pem`" ubuntu@ec2-52-200-21-14.compute-1.amazonaws.com" -ForegroundColor Yellow
  } else {
    Write-Host "Rule may already exist for your IP, or check AWS permissions." -ForegroundColor Yellow
  }
}
