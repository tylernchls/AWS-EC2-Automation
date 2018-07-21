const AWS = require('aws-sdk');

AWS.config.update({region: 'us-west-2'});
AWS.config.loadFromPath('./config.json');

let ec2 = new AWS.EC2({apiVersion: '2016-11-15'});

describeInstances()
.then(({instanceId, securityGroupId, keyName}) => {
    return terminateInstance(instanceId).then(() => {
        return {securityGroupId, keyName}
    })
})
.then(({securityGroupId, keyName}) => {
    return delay(60000).then(() => {
        return {securityGroupId, keyName}
    })
})
.then(({securityGroupId, keyName}) => {
    return deleteSecurityGroup(securityGroupId).then(() => {
        return keyName
    })
})
.then((keyName) => {
    return deleteKeyPair(keyName)
})

function describeInstances () {
    return new Promise((resolve, reject) => {
        let params = {
            DryRun: false,
            Filters: [
                {
                    Name: 'instance-state-name',
                    Values: [
                        'running',
                        'pending',
                        'stopped'
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
                let instanceId = data.Reservations[0].Instances[0].InstanceId;
                let securityGroupId = data.Reservations[0].Instances[0].SecurityGroups[0].GroupId
                let keyName = data.Reservations[0].Instances[0].KeyName
                return resolve({instanceId, securityGroupId, keyName})
            }           
        });
    })
}

function terminateInstance (instanceId) {
    return new Promise((resolve, reject) => {
        let params = {
            InstanceIds: [instanceId]
        };

        ec2.terminateInstances(params, function(err, data) {
            if (err) { return reject(err); } 
            else {
                console.log('Terminating your EC2 instance. This may take up to 1 minute.')
                return resolve(data)
            }           
        });
    })
}

function deleteSecurityGroup (securityGroupId) {
    return new Promise((resolve, reject) => {
        let params = { GroupId: securityGroupId };
           ec2.deleteSecurityGroup(params, function(err, data) {
             if (err) { return reject(err); }
             else {
                 console.log('Deleting the security group')
                 return resolve(data)
             }
           });
    })
}

function deleteKeyPair (keyName) {
    return new Promise((resolve, reject) => {
        let params = { KeyName: keyName };
           ec2.deleteKeyPair(params, function(err, data) {
             if (err) { return reject(err); }
             else {
                 console.log('Deleting the instances keypair')
                 return resolve(data)
             }
           });
    })
}

function delay (time) {
    return new Promise((resolve, reject) => {
        setTimeout(resolve, time)
    })
}