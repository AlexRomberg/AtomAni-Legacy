const Overlay = $('.userEditOverlay');
const Form = $('#userEditForm');
const FormTitle = $('#formTitle');
const ResetBtn = $('#resetBtn');
const NewCard = $('#newcard');
const DeleteButtons = $('.deletebtn');
const EditButtons = $('.editbtn');


NewCard.on('click', () => {
    Form.attr('/api/new/user');
    FormTitle.text('Benutzer Hinzufügen');
    Overlay.show();

    $('#UserPW').attr('required','required').removeAttr('placeholder');

    const frm = Form[0] as HTMLFormElement;
    // frm.reset(); <- fire reset of Form if possible
});

ResetBtn.on('click', () => {
    Overlay.hide();
});

DeleteButtons.on('click', (e) => {
    if (confirm('Wirklich Löschen?')) {
        const userId = $(e.target).parent().attr('userid');
        window.location.href = `/api/delete/user/${userId}`;
    }
});

EditButtons.on('click', (e) => {
    const userId = $(e.target).parent().attr('userid');

    Form.attr(`/api/edit/user/${userId}`);
    FormTitle.text('Benutzer Bearbeiten');
    Overlay.show();

    const card = $(e.target).parent().prev();


    $('#UserId').val(card.children('.infoarea').children('.userId').text());
    $('#UserName').val(card.children('.infoarea').children('.name').text());
    $('#UserPW').attr('placeholder', 'Unverändert').removeAttr('required');
    // $('#UserCanEdit')
    // $('#UserIsAdmin').

});