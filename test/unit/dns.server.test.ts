import { createHostedZone, isNameValid, isValueValid } from '~/lib/dns.server';
import { DnsRecordType } from '@prisma/client';

describe('DNS server lib function test', () => {
  let hostedZoneId: string;
  const rootDomain = 'starchart.com';
  const username = 'jdo12';

  const resetHostedZone = () => {
    try {
      fetch('http://localhost:5053/moto-api/reset', {
        method: 'POST',
      });
    } catch (error) {
      throw new Error(`Error occurred while deleting records in hosted zone: ${error}`);
    }
  };

  beforeAll(async () => {
    hostedZoneId = await createHostedZone(rootDomain);
    process.env.AWS_ROUTE53_HOSTED_ZONE_ID = hostedZoneId;
    process.env.ROOT_DOMAIN = rootDomain;
  });

  afterAll(() => resetHostedZone());

  test('Hosted zone is created and hosted zone is returned', () => {
    expect(hostedZoneId.length).toBeGreaterThan(0);
    expect(/^[A-Z0-9]+/.test(hostedZoneId)).toBe(true);
  });

  test('isNameValid() returns true when valid URL is passed. Otherwise it returns false', () => {
    expect(isNameValid(`osd700.${username}.${rootDomain}`, username)).toBe(true);
    expect(isNameValid(`osd-700.${username}.${rootDomain}`, username)).toBe(true);
    expect(isNameValid(`osd_700.${username}.${rootDomain}`, username)).toBe(true);
    expect(isNameValid(`_osd700.${username}.${rootDomain}`, username)).toBe(true);
    expect(isNameValid(`invalid__name.${username}.${rootDomain}`, username)).toBe(false);
    expect(isNameValid(`osd700..${username}.${rootDomain}`, username)).toBe(false);
    expect(isNameValid(`osd..700.${username}.${rootDomain}`, username)).toBe(false);
    expect(isNameValid(`osd700.a2.${username}.${rootDomain}`, username)).toBe(false);
    expect(isNameValid(`-osd700.${username}.${rootDomain}`, username)).toBe(false);
    expect(isNameValid(`osd700-.${username}.${rootDomain}`, username)).toBe(false);
    expect(isNameValid(`osd700_.${username}.${rootDomain}`, username)).toBe(false);
    expect(isNameValid(`osd--700.${username}.${rootDomain}`, username)).toBe(false);
    expect(isNameValid(`osd__700.${username}.${rootDomain}`, username)).toBe(false);
    expect(isNameValid(`osd@700.${username}.${rootDomain}`, username)).toBe(false);
    expect(isNameValid(`damn.${username}.${rootDomain}`, username)).toBe(false);
    expect(isNameValid(`osd-700.localhost`, username)).toBe(false);
    expect(isNameValid(`localhost`, username)).toBe(false);
  });

  test('isValueValue() return true when valid IP address is passed, otherwise returns false', () => {
    expect(isValueValid(DnsRecordType.A, '192.168.0.1')).toBe(true);
    expect(isValueValid(DnsRecordType.A, '0.0.0.0')).toBe(true);
    expect(isValueValid(DnsRecordType.AAAA, '2001:db8:3333:4444:5555:6666:7777:8888')).toBe(true);
    expect(isValueValid(DnsRecordType.AAAA, 'a:b:c:d:e:f:0:1')).toBe(true);
    expect(isValueValid(DnsRecordType.CNAME, 'test-domain')).toBe(true);

    expect(isValueValid(DnsRecordType.A, '192.168.0')).toBe(false);
    expect(isValueValid(DnsRecordType.A, '192.168.0.')).toBe(false);
    expect(isValueValid(DnsRecordType.A, '192.168.0.')).toBe(false);
    expect(isValueValid(DnsRecordType.A, 'a.b.c.d')).toBe(false);
    expect(isValueValid(DnsRecordType.AAAA, 'a:b:c:d:e:f:0:1:')).toBe(false);
    expect(isValueValid(DnsRecordType.AAAA, 'a:b:c:d:e:f:0:')).toBe(false);
    expect(isValueValid(DnsRecordType.AAAA, 'g:g:g:g:g:g:g:g')).toBe(false);
    expect(isValueValid(DnsRecordType.CNAME, '')).toBe(false);
  });
});
