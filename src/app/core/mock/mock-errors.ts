import { DisplayType, ErrorAction, FrontendErrorResponse } from '../models/checkout.models';

interface ErrorDefinition {
  status: number;
  displayType: DisplayType;
  code: string;
  title: string;
  description: string;
  primaryButton: ErrorAction;
  secondaryButton: ErrorAction | null;
}

const RETRY: ErrorAction = { label: 'Tentar novamente', url: 'RETRY' };
const CHANGE_PAYMENT_METHOD: ErrorAction = {
  label: 'Trocar meio de pagamento',
  url: '/checkout/pagamento',
};
const REVIEW_PAYMENT_DATA: ErrorAction = { label: 'Revisar dados', url: '/checkout/pagamento' };
const BACK_TO_PLANS: ErrorAction = { label: 'Escolher plano', url: '/planos' };
const SEE_CONFIRMATION: ErrorAction = { label: 'Ver confirmação', url: '/checkout/sucesso' };

export const MOCK_ERRORS = {
  INVALID_REQUEST: {
    status: 400,
    displayType: 'BLOCK',
    code: 'P-0001',
    title: 'Não foi possível continuar',
    description:
      'Algumas informações enviadas estão incompletas ou inválidas. Revise os dados e tente novamente.',
    primaryButton: RETRY,
    secondaryButton: { label: 'Voltar ao pagamento', url: '/checkout/pagamento' },
  },
  PAYMENT_DECLINED: {
    status: 422,
    displayType: 'BLOCK',
    code: 'P-1001',
    title: 'Pagamento não aprovado',
    description: 'Não foi possível concluir o pagamento. Tente novamente ou escolha outro meio.',
    primaryButton: RETRY,
    secondaryButton: CHANGE_PAYMENT_METHOD,
  },
  PRODUCT_NOT_FOUND: {
    status: 422,
    displayType: 'BLOCK',
    code: 'P-2001',
    title: 'Produto indisponível',
    description:
      'Um ou mais produtos escolhidos não estão disponíveis. Escolha outro plano para continuar.',
    primaryButton: BACK_TO_PLANS,
    secondaryButton: null,
  },
  CART_NOT_FOUND: {
    status: 404,
    displayType: 'BLOCK',
    code: 'P-3001',
    title: 'Carrinho não encontrado',
    description: 'Não encontramos o seu carrinho. Escolha um plano para começar uma nova compra.',
    primaryButton: BACK_TO_PLANS,
    secondaryButton: null,
  },
  CART_EXPIRED: {
    status: 410,
    displayType: 'BLOCK',
    code: 'P-3002',
    title: 'Carrinho expirado',
    description:
      'O tempo para concluir esta compra acabou. Escolha o plano novamente para continuar.',
    primaryButton: BACK_TO_PLANS,
    secondaryButton: null,
  },
  PAYMENT_METHOD_NOT_ALLOWED: {
    status: 422,
    displayType: 'INTERVENTION',
    code: 'P-4001',
    title: 'Meio de pagamento indisponível',
    description:
      'O meio de pagamento escolhido não está disponível para esta compra. Escolha outra opção.',
    primaryButton: CHANGE_PAYMENT_METHOD,
    secondaryButton: null,
  },
  INVALID_PAYMENT_DATA: {
    status: 422,
    displayType: 'INTERVENTION',
    code: 'P-4002',
    title: 'Dados de pagamento inválidos',
    description: 'Confira os dados de pagamento informados e tente novamente.',
    primaryButton: REVIEW_PAYMENT_DATA,
    secondaryButton: CHANGE_PAYMENT_METHOD,
  },
  PAYMENT_ALREADY_APPROVED: {
    status: 409,
    displayType: 'INTERVENTION',
    code: 'P-5001',
    title: 'Pagamento já aprovado',
    description: 'Esta compra já foi paga. Nenhuma nova cobrança foi realizada.',
    primaryButton: SEE_CONFIRMATION,
    secondaryButton: null,
  },
} satisfies Record<string, ErrorDefinition>;

export type MockErrorCode = keyof typeof MOCK_ERRORS;

export class MockBackendError extends Error {
  constructor(
    readonly status: number,
    readonly body: FrontendErrorResponse,
  ) {
    super(body.frontendError.title);
  }
}

export function mockError(errorCode: MockErrorCode, cartId: string | null): MockBackendError {
  const definition: ErrorDefinition = MOCK_ERRORS[errorCode];
  return new MockBackendError(definition.status, {
    displayType: definition.displayType,
    errorCode,
    cartId,
    frontendError: {
      code: definition.code,
      title: definition.title,
      description: definition.description,
      primaryButton: definition.primaryButton,
      secondaryButton: definition.secondaryButton,
    },
  });
}
