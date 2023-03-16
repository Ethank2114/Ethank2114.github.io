var updateOutput = function(input, output) {
	document.getElementById(output).innerHTML = input.value;
	refresh();
}

var leftArrow = function(input, output) {
	let i = document.getElementById(input);
	i.value--;
	updateOutput(i, output);
}

var rightArrow = function(input, output) {
	let i = document.getElementById(input);
	i.value++;
	updateOutput(i, output);
}