import { IError } from '../interfaces';
import targetListCheck from './targetListCheck';

const rules: {[key: string]: ({ status }: {status: string}) => IError[]} = {
  targetListCheck,
};

export default rules;
