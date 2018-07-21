#!/bin/bash
echo "Beginning to teardown your infrastructure"
node cleanup.js
echo "Terminating your EC2 instance. This may take up to 1 minute."
sleep 10
echo "Still waiting for the instance to fully terminate. Apologies"
sleep 40
echo "Deleting the security group"
sleep 3
echo "Deleting the instances keypair"
sleep 3
echo "Teardown complete, thanks for testing my project. Mahalo "