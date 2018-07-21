const AWS = require('aws-sdk');
const fs = require('fs');

AWS.config.update({region: 'us-west-2'});
AWS.config.loadFromPath('./config.json');

let ec2 = new AWS.EC2({apiVersion: '2016-11-15'});
let vpc = null;
let ec2Config = base64_encode('ec2-config.sh'); 
let ec2IpAddress = '';

function base64_encode(file) {
    var bitmap = fs.readFileSync(file);
    return new Buffer(bitmap).toString('base64');
}

describeVpcs()
.then((paramsSecurityGroup) => {
    return ec2CreateSecurityGroup(paramsSecurityGroup)
})
.then((data) => {
    return authorizeSecurityGroupIngress(data)
})
.then(({data, SecurityGroupId}) => {
    return SecurityGroupId
})
.then((SecurityGroupId) => { 
    return createKeyPair().then((Key) => {
        return {SecurityGroupId, Key}
    })
})
.then(({SecurityGroupId, Key}) => {
    return createEc2(SecurityGroupId, Key)
})
.then((InstanceId) => {
    return tagInstance(InstanceId)
})
.then(() => {
    return describeInstances()
})
.then((ipAddress) => {
    return getIpAddress(ipAddress)
})
.catch((err) => {
    console.log('Failed to create your instance', err)
})

function describeVpcs () {
    return new Promise((resolve, reject) => {
        ec2.describeVpcs(function(err, data) {
            if (err) { return reject(err); }
            else {
                let vpc = data.Vpcs[0].VpcId;
                let paramsSecurityGroup = {
                    Description: 'SG for web server',
                    GroupName: 'web_serverSG',
                    VpcId: vpc
                };
                return resolve(paramsSecurityGroup);
            }
        })
    })
}

function ec2CreateSecurityGroup (paramsSecurityGroup) {
    return new Promise((resolve, reject) => {
       ec2.createSecurityGroup(paramsSecurityGroup, function(err, data) {
           if (err) { return reject(err); }
           let SecurityGroupId = data.GroupId;
           let paramsIngress = {
               GroupName: 'WEB_SERVERSG',
               IpPermissions:[
                    {
                        IpProtocol: "tcp",
                        FromPort: 80,
                        ToPort: 80,
                        IpRanges: [{"CidrIp":"0.0.0.0/0"}]
                    },
                    {
                        IpProtocol: "tcp",
                        FromPort: 443,
                        ToPort: 443,
                        IpRanges: [{"CidrIp":"0.0.0.0/0"}]
                    },
                    {
                        IpProtocol: "tcp",
                        FromPort: 22,
                        ToPort: 22,
                        IpRanges: [{"CidrIp":"0.0.0.0/0"}]
                    }
                ]
            };
            return resolve({paramsIngress, SecurityGroupId});
       });
    });
}

function authorizeSecurityGroupIngress({paramsIngress, SecurityGroupId}) {
    return new Promise((resolve, reject) => {
        ec2.authorizeSecurityGroupIngress(paramsIngress, function(err, data) {
            if (err) { return reject(err); }
            else {
                return resolve({data, SecurityGroupId});
            }
        });
    })
}

function createKeyPair () {
    return new Promise((resolve, reject) => {
        let params = {
            KeyName: 'WEB_SERVER'
         };

         ec2.createKeyPair(params, function(err, data) {
             if (err) { return reject(err); }
             else {
                 writeKeyToFile(data.KeyMaterial)
                 return resolve(data)
             }
         })
    })
}

function createEc2 (securityGroupID, key) {
    return new Promise((resolve, reject) => {
        let instanceParams = {
            ImageId: 'ami-a9d09ed1',
            InstanceType: 't2.micro',
            KeyName: key.KeyName,
            MinCount: 1,
            MaxCount: 1,
            SecurityGroupIds: [securityGroupID],
            UserData: ec2Config
        };
        
        ec2.runInstances(instanceParams, function(err, data) {
            if (err) { return reject(err); }
            else{
                return resolve(data.Instances[0].InstanceId);
            }
        });
    })
}

function tagInstance (instanceId) {
    return new Promise((resolve, reject) => {
        let tagParams = {Resources: [instanceId], Tags: [
            {
               Key: 'Name',
               Value: 'Web_Server'
            }
         ]};

        ec2.createTags(tagParams, function(err, data) {
            if (err) { return reject(err); }
            else {
                return resolve(data);
            }
        })
    })
}

function writeKeyToFile(keyPair) {
    fs.writeFile('web_server_key.pem', keyPair, (err) => {  
        if (err) throw err;
    });
}

function describeInstances () {
    return new Promise((resolve, reject) => {
        let params = {
            DryRun: false,
            Filters: [
                {
                    Name: 'instance-state-name',
                    Values: [
                        'running',
                        'pending'
                    ],
                },
                {
                    Name: 'tag:Name',
                    Values: ['Web_Server'],
                },
            ]
        };
        ec2.describeInstances(params, function(err, data) {
            if (err) { return reject(err); }
            else {
                return resolve(data.Reservations[0].Instances[0].PublicIpAddress)
            }           
        });
    })
}

function getIpAddress (ipAddress) {
    ec2IpAddress = ipAddress
    console.log('Congrats your new server is up and running with the IP of', ec2IpAddress);
}




