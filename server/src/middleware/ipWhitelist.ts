import { Request, Response, NextFunction } from 'express';
import ipaddr from 'ipaddr.js';
import { config } from '../config/index';
import { logger } from '../utils/logger';
import { getClientIp } from '../utils/helpers';

interface ParsedRange {
  addr: ipaddr.IPv4 | ipaddr.IPv6;
  prefixLength: number;
}

function parseIpList(ips: string[]): ParsedRange[] {
  const ranges: ParsedRange[] = [];
  for (const entry of ips) {
    try {
      if (entry.includes('/')) {
        const [addr, prefix] = ipaddr.parseCIDR(entry);
        ranges.push({ addr, prefixLength: prefix });
      } else {
        const addr = ipaddr.parse(entry);
        ranges.push({ addr, prefixLength: addr.kind() === 'ipv4' ? 32 : 128 });
      }
    } catch {
      logger.warn({ ip: entry }, 'Invalid IP/CIDR in whitelist config — skipping');
    }
  }
  return ranges;
}

function normalizeToIpv4(addr: ipaddr.IPv4 | ipaddr.IPv6): ipaddr.IPv4 | ipaddr.IPv6 {
  if (addr.kind() === 'ipv6' && (addr as ipaddr.IPv6).isIPv4MappedAddress()) {
    return (addr as ipaddr.IPv6).toIPv4Address();
  }
  return addr;
}

function isIpInRanges(clientIp: string, ranges: ParsedRange[]): boolean {
  try {
    const parsed = normalizeToIpv4(ipaddr.parse(clientIp));

    for (const range of ranges) {
      const rangeAddr = normalizeToIpv4(range.addr);
      const prefixLen = rangeAddr !== range.addr ? range.prefixLength - 96 : range.prefixLength;

      if (parsed.kind() === rangeAddr.kind() && parsed.match([rangeAddr, prefixLen])) {
        return true;
      }
    }
  } catch {
    logger.warn({ clientIp }, 'Failed to parse client IP for whitelist check');
  }
  return false;
}

const configuredRanges = parseIpList(config.ipWhitelistIps);

export function ipWhitelist(req: Request, res: Response, next: NextFunction) {
  if (!config.ipWhitelistEnabled) return next();

  const clientIp = getClientIp(req);

  // Unknown IP → block in allowlist mode, allow in blocklist mode
  if (clientIp === 'unknown') {
    if (config.ipWhitelistMode === 'allowlist') {
      res.status(403).json({ status: 'error', message: 'Access denied' });
      return;
    }
    return next();
  }

  const matched = isIpInRanges(clientIp, configuredRanges);

  if (config.ipWhitelistMode === 'allowlist' && !matched) {
    logger.warn({ ip: clientIp, path: req.path }, 'Blocked by IP allowlist');
    res.status(403).json({ status: 'error', message: 'Access denied' });
    return;
  }

  if (config.ipWhitelistMode === 'blocklist' && matched) {
    logger.warn({ ip: clientIp, path: req.path }, 'Blocked by IP blocklist');
    res.status(403).json({ status: 'error', message: 'Access denied' });
    return;
  }

  next();
}
