#!/bin/bash
# Add your current IP to the EC2 security group's SSH rule
# Usage: ./scripts/allow-ssh-from-my-ip.sh INSTANCE_ID
# Requires: AWS CLI configured

set -e
InstanceId="${1:?Usage: $0 INSTANCE_ID}"

echo "Getting your public IP..."
myIp=$(curl -s https://checkip.amazonaws.com)
cidr="${myIp}/32"
echo "Your IP: $myIp"

echo ""
echo "Looking up security group for instance $InstanceId..."
sgIds=$(aws ec2 describe-instances --instance-ids "$InstanceId" \
  --query "Reservations[0].Instances[0].SecurityGroups[*].GroupId" \
  --output text 2>/dev/null || true)

if [ -z "$sgIds" ]; then
  echo "Failed to get security group. Check instance ID and AWS CLI (aws configure)."
  exit 1
fi

for sgId in $sgIds; do
  echo "Adding SSH rule to security group $sgId..."
  if aws ec2 authorize-security-group-ingress \
    --group-id "$sgId" \
    --protocol tcp \
    --port 22 \
    --cidr "$cidr" 2>/dev/null; then
    echo "Done. You can now SSH in:"
    echo "  ssh -i betting.forum.pem ubuntu@ec2-52-200-21-14.compute-1.amazonaws.com"
  else
    echo "Rule may already exist for your IP, or check AWS permissions."
  fi
done
