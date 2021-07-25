const dropDown = document.getElementById('loginInformation')!;
const dropDownBox = document.getElementById('loginDropdown')!;

let isVisible = false;
dropDown.addEventListener('click', () => {
    if (isVisible) {
        dropDownBox.style.maxHeight = "0px";
        dropDownBox.style.borderBottomLeftRadius = "25px";
        dropDownBox.style.borderBottomRightRadius = "25px";
        dropDownBox.classList.remove('shadow');
    } else {
        dropDownBox.style.maxHeight = "200px";
        dropDownBox.style.borderBottomLeftRadius = "10px";
        dropDownBox.style.borderBottomRightRadius = "10px";
        dropDownBox.classList.add('shadow');
    }
    isVisible = !isVisible;
});

dropDownBox.style.width = `${dropDown.offsetWidth}px`;