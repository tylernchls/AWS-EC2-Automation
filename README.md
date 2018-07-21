# TYLER NICHOLS MINIPROJECT

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for testing purposes. See deployment for notes on how to deploy the project.

### Prerequisites
- Latest version on Node.js. Run ```node -v``` to check if already installed on your machine. If not, installation instructions can be found [here](https://nodejs.org/en/download/).
- AWS account preferably with Admin role. If you need an account, please create one [here](https://portal.aws.amazon.com/billing/signup?redirect_url=https%3A%2F%2Faws.amazon.com%2Fregistration-confirmation#/start).

### Installing
1. Clone the repository onto your local machine, cd into the project, and open on your favorite text editor.
2. Run the following command in your terminal ```npm install -S aws-sdk```.
3. Rename the file **config-example.json** to **config.json** or run this command in your terminal ```cp config-example.json config-example.json```
4. In the AWS console, navigate to IAM => Users => Security Credentials. Create a new set of credentials and copy & paste your new keys in the **config.json** file, leaving the regions default value and save the file. 
5. Run the following command in your terminal ```chmod +x startup.sh ec2-config.sh```. This will give execution writes the the bash scripts.

## Running the tests

To be filled in


## Deployment
Now for the fun part!!!!!!. Lets build some Infrastructure.
- **Please Note**, the following will be automatically built for you upon running the ```startup.sh``` script
1. Linux EC2 instance installed with Apache Web Server. It will have the tags of **Web_Server**.
2. Security Group called **WEB_SERVERSG** with ports 80, 443, and 22 open with IP range of 0.0.0.0/0.
3. A new Key Pair called **WEB_SERVER**.
4. A file named **web_server_key.pem**, containing your private key that can be used to SSH into your new instance.
- In your terminal, run the command ```./startup.sh```
- Upon completion, navigate to the IP Address that is provided to you. You should see the message ***Automation for the people***.

## Built With
- AWS SDK for JavaScript in Node.js
- My hands :)
