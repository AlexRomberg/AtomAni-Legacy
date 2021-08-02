
class CEditorCard {
    private EditorCard: JQuery<HTMLElement>;
    private EditorImgage: JQuery<HTMLElement>;
    private EditorTextfield: JQuery<HTMLElement>;
    private EditorTitle: JQuery<HTMLElement>;
    private MenuOpen = false;

    private OptionNewExperiment: JQuery<HTMLElement>;
    private OptionNewFolder: JQuery<HTMLElement>;
    private OptionExpEditor: JQuery<HTMLElement>;
    private OptionExpImport: JQuery<HTMLElement>;
    private OptionFoldName: JQuery<HTMLElement>;
    private OptionFoldSave: JQuery<HTMLElement>;
    private OptionCancel: JQuery<HTMLElement>;

    constructor() {
        this.EditorCard = $('#editor-card');
        this.EditorImgage = $('#editor-card-img');
        this.EditorTextfield = $('#editor-card .Text');
        this.EditorTitle = $('#editor-card .Text h2');

        this.OptionNewExperiment = $('#option-new-experiment');
        this.OptionNewFolder = $('#option-new-folder');
        this.OptionExpEditor = $('#option-exp-editor');
        this.OptionExpImport = $('#option-exp-import');
        this.OptionFoldName = $('#option-fold-name');
        this.OptionFoldSave = $('#option-fold-save');
        this.OptionCancel = $('#option-cancel');


        this.EditorCard.on('click', this.openMenu.bind(this));
        this.OptionCancel.on('click', this.closeMenu.bind(this));
        this.OptionNewExperiment.on('click', this.openExperimentMenu.bind(this));
        this.OptionNewFolder.on('click', this.openFolderMenu.bind(this));

        this.OptionExpEditor.on('click', () => {
            window.location.href = `/editor/${this.OptionExpEditor.attr('folder')}`;
            this.closeMenu();
        });
        this.OptionExpImport.on('click', () => {
            window.location.href = `/import/${this.OptionExpImport.attr('folder')}`;
            this.closeMenu();
        });
        this.OptionFoldSave.on('click', () => {
            const name = this.OptionFoldName.val()!.toString().replace(/[^a-z0-9\u00E0-\u00FC_\-\ ]|^[ \-_]*/ig, '');
            if (name.length > 0 && name === this.OptionFoldName.val()!.toString()) {
                window.location.href = `/api/new/folder/?folder=${this.OptionExpImport.attr('folder')}&name=${this.OptionFoldName.val()}`;
                this.closeMenu();
            } else {
                this.OptionFoldName.focus();
            }
        });
    }

    public show() {
        this.EditorCard.show(300);
    }

    public hide() {
        this.EditorCard.hide(300);
        this.closeMenu();
    }

    private openMenu() {
        if (!this.MenuOpen) {
            this.EditorImgage.css('height', '0px');
            this.EditorTextfield.css('marginTop', '-20px');
            this.EditorCard.removeClass('selectable-no-border');

            this.MenuOpen = true;
        }
    }

    private closeMenu() {
        this.EditorTitle.text(this.EditorTitle.attr('text-add')!);
        this.OptionNewExperiment.show();
        this.OptionNewFolder.show();
        this.OptionExpEditor.hide();
        this.OptionExpImport.hide();
        this.OptionFoldName.hide();
        this.OptionFoldSave.hide();


        if (this.MenuOpen) {
            this.EditorImgage.css('height', '150px');
            this.EditorTextfield.css('marginTop', '0px');
            this.EditorCard.addClass('selectable-no-border');

            this.MenuOpen = false;
            return false; // prevent other events from being fired
        }
    }

    private openExperimentMenu() {
        this.EditorTitle.text(this.EditorTitle.attr('text-newExp')!);
        this.OptionNewExperiment.hide();
        this.OptionNewFolder.hide();
        this.OptionExpEditor.show();
        this.OptionExpImport.show();
        this.OptionFoldName.hide();
        this.OptionFoldSave.hide();
    }

    private openFolderMenu() {
        this.EditorTitle.text(this.EditorTitle.attr('text-newFold')!);
        this.OptionNewExperiment.hide();
        this.OptionNewFolder.hide();
        this.OptionExpEditor.hide();
        this.OptionExpImport.hide();
        this.OptionFoldName.show();
        this.OptionFoldSave.show();
        this.OptionFoldName.focus();
    }
}

class CCardControls {
    private EditorCard: CEditorCard;
    private PenBtn: JQuery<HTMLElement>;
    private Cards: JQuery<HTMLElement>;
    private CardMenuOpen = false;

    constructor() {
        this.EditorCard = new CEditorCard();
        this.PenBtn = $('#pen');
        this.Cards = $('.card-container');

        this.PenBtn.on('click', this.toggleCardMenu.bind(this));
        $('.deleteBtn').on('click', this.deleteItem);
        $('.editBtn').on('click', this.editItem);
        $('.Text input').on('click', () => { return false; })
    }

    private deleteItem(e: JQuery.ClickEvent) {
        const target = e.target as HTMLButtonElement;
        if (confirm($('.deleteBtn').attr('question'))) {
            window.location.href = target.getAttribute('path')!;
        }
    }

    private editItem(e: JQuery.ClickEvent) {
        const target = e.target as HTMLElement;
        const card = $(target).parent().parent()[0];
        const input = $(card).children('a').children('.Text').addClass('edit-title').children('input');
        input.focus()

        $(target).parent().children().hide();
        const saveBtn = $(target).parent().children('.saveBtn').on('click', (e) => { CardControls.saveChanges(e); });
        saveBtn.show();
        const cancelBtn = $(target).parent().children('.cancelBtn').on('click', (e) => { CardControls.resetCards(); });
        cancelBtn.show();
    }

    public saveChanges(e: JQuery.ClickEvent) {
        const input = $(e.target).parent().siblings('a').children('.Text').children('input');
        const name = input.val()!.toString().replace(/[^a-z0-9\u00E0-\u00FC_\-\ ]|^[ \-_]*/ig, '');
        if (name.length > 0 && name === input.val()!.toString()) {
            window.location.href = `${$(e.target).attr('path')!}?name=${name}`;
            this.resetCards();
        } else {
            input.focus();
        }
    }

    public resetCards() {
        $('.edit-title').removeClass('edit-title');
        $('.card-controls').children('.saveBtn').hide().off('click');
        $('.card-controls').children('.cancelBtn').hide().off('click');
        $('.card-controls').children('.editBtn').show();
        $('.card-controls').children('.deleteBtn').show();
    }

    private toggleCardMenu() {
        if (this.CardMenuOpen) {
            this.Cards.addClass('selectable-no-border');
            this.Cards.css('max-height', '200px');
            this.EditorCard.hide();
        } else {
            this.Cards.removeClass('selectable-no-border');
            this.Cards.css('max-height', '250px');
            this.EditorCard.show();
        }
        this.CardMenuOpen = !this.CardMenuOpen;
    }
}

const CardControls = new CCardControls();