import type { Agent } from '@prisma/client';
import { useCallback, useEffect, useState } from 'react';
import useSWR from 'swr';

import { AgentInterfaceConfig } from '@app/types/models';
import { fetcher } from '@app/utils/swr-fetcher';

const API_URL = process.env.NEXT_PUBLIC_DASHBOARD_URL;

interface RateResponse {
  isRateExceeded: boolean;
  rateExceededMessage?: string;
  handleIncrementRateLimitCount: () => any;
}

const useRateLimit = ({ agentId }: { agentId?: string }): RateResponse => {
  const [isRateExceeded, setIsRateExceeded] = useState(false);
  // const [counter, setCounter] = useState(0);

  const getAgentQuery = useSWR<Agent>(
    agentId ? `${API_URL}/api/agents/${agentId}` : null,
    fetcher
  );

  const config = getAgentQuery?.data?.interfaceConfig as AgentInterfaceConfig;
  const rateLimit = config?.rateLimit || 0;

  const handleIncrementRateLimitCount = useCallback(() => {
    let currentRateCount = Number(localStorage.getItem('rateLimitCount')) || 0;
    localStorage.setItem('rateLimitCount', `${++currentRateCount}`);

    if (rateLimit > 0 && currentRateCount >= rateLimit) {
      setIsRateExceeded(true);
    }
  }, [rateLimit]);

  useEffect(() => {
    if (!config?.rateLimitInterval) return;

    const interval = setInterval(() => {
      localStorage.setItem('rateLimitCount', '0');
    }, config?.rateLimitInterval * 1000);

    return () => clearInterval(interval);
  }, [config]);

  // keep the current behaviour if rateLimit or rateLimitInterval is not provided
  return {
    isRateExceeded,
    handleIncrementRateLimitCount,
    rateExceededMessage: config?.rateLimitMessage || 'Usage limit reached',
  };
};

export default useRateLimit;
