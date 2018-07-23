const AWS = require('aws-sdk');
const app = require('./util.js')

app.describeVpcs()
.then((paramsSecurityGroup) => {
    return app.ec2CreateSecurityGroup(paramsSecurityGroup)
})
.then((data) => {
    return app.authorizeSecurityGroupIngress(data)
})
.then(({data, SecurityGroupId}) => {
    return SecurityGroupId
})
.then((SecurityGroupId) => { 
    return app.createKeyPair().then((Key) => {
        return {SecurityGroupId, Key}
    })
})
.then(({SecurityGroupId, Key}) => {
    return app.createEc2(SecurityGroupId, Key)
})
.then((InstanceId) => {
    return app.tagInstance(InstanceId)
})
.then(() => {
    return app.describeInstances()
})
.then((ipAddress) => {
    return app.getIpAddress(ipAddress)
})
.catch((err) => {
    console.log('Failed to create your instance', err)
});









