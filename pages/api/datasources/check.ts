import { AppDatasource, SubscriptionPlan } from '@prisma/client';
import { NextApiResponse } from 'next';

import { UpsertDatasourceSchema } from '@app/components/DatasourceForms/Base';
import { AppNextApiRequest } from '@app/types/index';
import { createAuthApiHandler, respond } from '@app/utils/createa-api-handler';
import { DatasourceLoader } from '@app/utils/loaders';
import validate from '@app/utils/validate';

const handler = createAuthApiHandler();

export const checkDatasource = async (
  req: AppNextApiRequest,
  res: NextApiResponse
) => {
  const data = req.body as UpsertDatasourceSchema;
  const session = req.session;
  let isValid = true;
  let message = '';
  let size = 0;

  try {
    size = await new DatasourceLoader({
      id: 'ID',
      config: data.config,
      type: data.type,
      name: data.name,
      datastoreId: data.datastoreId,
    } as AppDatasource).getSize(data.datasourceText);
  } catch (err: any) {
    console.log('[checkDatasource]', err?.response?.status);
  }

  if (session.user.plan === SubscriptionPlan.free && size / 1000000 > 1.1) {
    isValid = false;
    message =
      'The maximum file size is 1MB on the free plan. Contact support@databerry.ai to upgrade your account';
  }

  return {
    valid: isValid,
    message,
    size,
  };
};

handler.post(
  validate({
    body: UpsertDatasourceSchema,
    handler: respond(checkDatasource),
  })
);

export default handler;
