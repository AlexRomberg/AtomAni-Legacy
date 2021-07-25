export class CValidation {
    public Regex = {
        organisation: {
            id: /[^a-zA-Z0-9]/g,
            name: /[^a-z0-9\u00E0-\u00FC_\-\ ]/ig
        },
        user: {
            id: /[^0-9]/g,
            identification: /[^a-zA-Z0-9]/g,
            name: /[^a-z0-9\u00E0-\u00FC_\-\ ]/ig,
            pw: /[^$0-9a-zA-Z/\.]|^.{0,59}$|^.{61,}$/g,
            imagename: /[^0-9a-f]/ig
        },
        folder: {
            id: /[^\-0-9]/g,
            name: /[^a-z0-9\u00E0-\u00FC_\-\ ]/ig,
            icon: /[^0-9a-f]/ig
        },
        experiment: {
            id: /[^0-9a-f]/ig,
            name: /[^a-z0-9\u00E0-\u00FC_\-\ ]/ig,
            icon: /[^0-9a-f]/ig
        }
    }

    public NumericBounderies = {
        folder: {
            id: {
                min: -1,
                max: 4294967295
            }
        }
    }

    public cleanInput(input: string, regex: RegExp) {
        input = input.toString();
        return input.replace(regex, '');
    }

    public checkNumericBounderies(input: string | number, bounderies: { min: number; max: number; }): boolean {
        const inputNumeric: number = +input;

        return inputNumeric >= bounderies.min && inputNumeric < bounderies.max;
    }
}