import type {
  ActionPostRequest,
  TypedActionParameter,
} from '../../actions-spec';
import { Action } from '../Action';
import { AbstractActionComponent } from './AbstractActionComponent';

export class ButtonActionComponent extends AbstractActionComponent {
  constructor(
    protected _parent: Action,
    protected _label: string,
    protected _href: string,
    protected _parameters?: TypedActionParameter[],
    protected _parentComponent?: AbstractActionComponent,
  ) {
    super(_parent, _label, _href, _parameters);
  }

  get parentComponent() {
    return this._parentComponent ?? null;
  }

  protected buildBody(account: string): ActionPostRequest {
    return { account };
  }

  get href(): string {
    return this._href;
  }
}
