// palette graphique du site
const colorBackInput = "rgb(133, 236, 228)";
const color_2 = "rgb(85, 224, 214)";
const colorBackButton = "rgb(48, 213, 201)";
const color_4 = "rgb(12, 201, 187)";
const colorTextSelectTheme = "rgb(0, 160, 148)";

const colorBody= "rgb(145, 176, 238)";
const colorScrollBarThumb = "rgb(101, 144, 228)";
const colorNavClicked = "rgb(66, 117, 219)";
const color_2_4 = "rgb(32, 91, 208)";
const colorTextP = "rgb(12, 66, 172)";

const colorBackLogo = "rgb(149, 246, 139)";
const colorSelectedLi = "rgb(106, 240, 92)";
const colorBackSelectTheme = "rgb(70, 235, 53)";
const colorBorder = "rgb(34, 229, 14)";
const colorTextInput = "rgb(20, 210, 0)";

//document.getElementById("Logo").style.background = colorBackLogo;
// document.querySelector("header").style.background = colorBackLogo;

function openImg(nameImg) {
    window.open('popupColoriage.php?name=' + nameImg, '_blank','popUpWindow','height=400,width=300,left=100,top=-100,resizable=yes,scrollbars=no,toolbar=no,menubar=no,location=no,directories=no,status=yes');
}