const AWS = require('aws-sdk');

AWS.config.update({region: 'us-west-2'});
AWS.config.loadFromPath('./config.json');

let ec2 = new AWS.EC2({apiVersion: '2016-11-15'});
let vpc = null;

describeVpcs()
.then((paramsSecurityGroup) => {
    return ec2CreateSecurityGroup(paramsSecurityGroup)
})
.then((data) => {
    return authorizeSecurityGroupIngress(data)
})
.then(({data, SecurityGroupId}) => {
    console.log(SecurityGroupId)
    return SecurityGroupId
})
.then((SecurityGroupId) => { 
    return createKeyPair().then((Key) =>{
        return {SecurityGroupId, Key}
    })
})
.then(({SecurityGroupId, Key}) => {
    return createEc2(SecurityGroupId, Key)
})
.then((InstanceId) => {
    return tagInstance(InstanceId)
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
                console.log("Ingress Successfully Set", data);
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
                 console.log('key', JSON.stringify(data));
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
            SecurityGroupIds: [securityGroupID]
        };
        
        ec2.runInstances(instanceParams, function(err, data) {
            if (err) { return reject(err); }
            else{
                console.log("DATAAAAAA", data);  
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
                console.log('Instance Tagged')
                return resolve(data);
            }
        })
    })
}










