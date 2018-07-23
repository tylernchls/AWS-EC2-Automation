const app = require('../util');
const chai = require('chai');
const expect = chai.expect;
const should = chai.should;

describe('Infrastructure Build', (() => {
    it('DescribeVPC() should return the correct object keys', ((done) => {
        app.describeVpcs()
        .then((value) => {
            expect(value).to.contain.keys('Description', 'GroupName', 'VpcId');
            done();
        });
    }));

    it('Ec2CreateSecurityGroup() should return SecurityGroupId & SecurityGroupID', ((done) => {
        let paramsSecurityGroup = {
            Description: 'SG for web server',
            GroupName: 'web_serverSG',
        };
        app.ec2CreateSecurityGroup(paramsSecurityGroup)
        .then((value) => {
            expect(value).to.contain.keys('paramsIngress', 'SecurityGroupId');
            done();
        });
    }));

    it('createKeyPair() should return correct key', ((done) => {
        let params = {
            KeyName: 'WEB_SERVER'
         };
        app.createKeyPair(params)
        .then((value) => {
            expect(value).to.contain.keys('KeyFingerprint', 'KeyName'); 
            done();         
        });
    }));
}));
