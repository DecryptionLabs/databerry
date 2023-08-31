import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Checkbox, FormLabel, Typography } from '@mui/joy';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import Input from '@app/components/Input';
import { AgentInterfaceConfig } from '@app/types/models';

const rateLimitSchema = AgentInterfaceConfig.pick({
  rateLimit: true,
  rateLimitInterval: true,
  rateLimitMessage: true,
  isRateActive: true,
});

export type RateLimitFields = z.infer<typeof rateLimitSchema>;

interface IRateLimitFormProps {
  onSubmit(args: RateLimitFields): Promise<void>;
  isRateActive?: boolean;
  rateLimit?: number;
  rateLimitInterval?: number;
  rateLimitMessage?: string;
}

const RateLimitForm: React.FC<IRateLimitFormProps> = ({
  onSubmit,
  isRateActive = false,
  rateLimit,
  rateLimitInterval,
  rateLimitMessage,
}) => {
  const { register, control, handleSubmit, watch } = useForm<RateLimitFields>({
    resolver: zodResolver(rateLimitSchema),
    defaultValues: {
      isRateActive,
      rateLimit,
      rateLimitInterval,
      rateLimitMessage,
    },
  });
  const isFormActive = watch('isRateActive');

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <FormLabel>Rate Limit</FormLabel>
      <Typography
        level="body3"
        sx={{
          mb: 2,
        }}
      >
        Limit the number of messages sent from one device on the Chat Bubble,
        iFrame and Standalone integrations. (max X messages every Y seconds)
      </Typography>

      <div className="flex space-x-4 my-4">
        <Checkbox
          size="lg"
          {...register('isRateActive')}
          defaultChecked={isRateActive}
        />
        <div className="flex flex-col">
          <FormLabel>Rate Activation</FormLabel>
          <Typography level="body3">
            When activated, you can limit the number of messages sent from one
            device on the Chat Bubble, iFrame and Standalone integrations.
          </Typography>
        </div>
      </div>

      <Input
        control={control as any}
        sx={{
          mb: 2,
        }}
        label="Rate Limit (max number of message)."
        {...register('rateLimit')}
        disabled={!isFormActive}
      />
      <Input
        control={control as any}
        sx={{
          mb: 2,
        }}
        label="Interval (in seconds)"
        disabled={!isFormActive}
        {...register('rateLimitInterval')}
        onChange={(e) => {
          console.log(typeof e.target.value);
        }}
      />
      <Input
        control={control as any}
        sx={{
          mb: 2,
        }}
        disabled={!isFormActive}
        label="Rate Limit Reached Message"
        placeholder="Usage limit reached"
        {...register('rateLimitMessage')}
      />

      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <Button
          type="submit"
          variant="solid"
          color="primary"
          sx={{ ml: 2, mt: 2 }} // Adjust the margin as needed
        >
          Save
        </Button>
      </div>
    </form>
  );
};

export default RateLimitForm;
