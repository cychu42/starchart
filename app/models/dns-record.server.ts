import { DnsRecordStatus } from '@prisma/client';
import dayjs from 'dayjs';
import { prisma } from '~/db.server';

import type { DnsRecord } from '@prisma/client';

export const createUserDnsRecord = async (
  data: Pick<DnsRecord, 'username' | 'type' | 'subdomain' | 'value'>
) => {
  if (process.env.USER_DNS_RECORD_LIMIT) {
    if ((await getUserDnsRecordCount(data.username)) >= Number(process.env.USER_DNS_RECORD_LIMIT)) {
      throw new Error('User has reached the maximum number of dns records');
    }
  }

  if (await doesDnsRecordExist(data)) {
    throw new Error('DNS Record already exists');
  }

  const result = await createDnsRecord(data);

  if (!result) {
    throw new Error('Could not create a DNS record in DB');
  }
  return result.id;
};

export function getDnsRecordsByUsername(username: DnsRecord['username']) {
  return prisma.dnsRecord.findMany({ where: { username } });
}

export function getDnsRecordById(id: DnsRecord['id']) {
  return prisma.dnsRecord.findUnique({ where: { id } });
}

export function getUserDnsRecordCount(username: DnsRecord['username']) {
  return prisma.dnsRecord.count({
    where: {
      username,
    },
  });
}

export function createDnsRecord(
  data: Pick<DnsRecord, 'username' | 'type' | 'subdomain' | 'value'>
) {
  // Set expiration date 6 months from now
  const expiresAt = dayjs().set('month', 6).toDate();
  const status = DnsRecordStatus.pending;

  return prisma.dnsRecord.create({ data: { ...data, expiresAt, status } });
}

// Update an existing DNS Record's data, or status, or both.
export function updateDnsRecordById(
  id: DnsRecord['id'],
  data:
    | Pick<DnsRecord, 'status'>
    | (Pick<DnsRecord, 'type' | 'subdomain' | 'value'> &
        Partial<Pick<DnsRecord, 'description' | 'course' | 'ports' | 'status'>>)
) {
  return prisma.dnsRecord.update({
    where: { id },
    data: {
      ...data,
      // If the record is changing to the `active` status, update expiry too
      expiresAt:
        data.status === DnsRecordStatus.active ? dayjs().set('month', 6).toDate() : undefined,
    },
  });
}

export function renewDnsRecordById(id: DnsRecord['id']) {
  return prisma.dnsRecord.update({
    where: {
      id,
    },
    data: {
      expiresAt: dayjs().set('month', 6).toDate(),
    },
  });
}

export async function doesDnsRecordExist(
  data: Pick<DnsRecord, 'username' | 'type' | 'subdomain' | 'value'>
) {
  const { username, type, subdomain, value } = data;
  const count = await prisma.dnsRecord.count({
    where: {
      username,
      type,
      subdomain,
      value,
    },
  });

  return count > 0;
}

export function deleteDnsRecordById(id: DnsRecord['id']) {
  return prisma.dnsRecord.delete({ where: { id } });
}

export function getExpiredDnsRecords() {
  return prisma.dnsRecord.findMany({
    where: {
      expiresAt: {
        lt: new Date(),
      },
    },
    include: {
      user: true,
    },
  });
}
