// eventListeners.js

const variables = ["minSpeed", "maxSpeed", "turnFactor", "avoidFactor", "centerFactor", "matchFactor", "mouseFactor"];

updateGlobal = function(name) {
	let value = document.getElementById(name + "Value");
	let code = name + " = " + value.innerHTML + ";";

	eval(code);
}

bindSliderToValue = function(name) {
	let slider = document.getElementById(name + "Slider");
	let value = document.getElementById(name + "Value");
	slider.oninput = function() {
		value.innerHTML = slider.value;
		updateGlobal(name);
	}
}

bindArrowsToValue = function(name) {
	let leftArrow = document.getElementById(name + "LeftArrow");
	let rightArrow = document.getElementById(name + "RightArrow");

	let value = document.getElementById(name + "Value");
	let slider = document.getElementById(name + "Slider");

	console.log("super outer")

	leftArrow.onclick = function() {
		let min = parseFloat(slider.min);
		if(parseFloat(value.innerHTML) > min) {
			slider.value = parseFloat(slider.value) - parseFloat(slider.step);
			value.innerHTML = slider.value;
			updateGlobal(name);
		}
	}

	rightArrow.onclick = function() {
		let max = parseFloat(slider.max);
		if(parseFloat(value.innerHTML) < max) {
			slider.value = parseFloat(slider.value) + parseFloat(slider.step);;
			value.innerHTML = slider.value;
			updateGlobal(name);
		}
	}
}

bindColorSelector = function(name) {
	let colorSelector = document.getElementById(name);

	colorSelector.onchange = function() {

		console.log(colorSelector.value)

		theGame.populate(colorSelector.value);
	}

}

bindColorSelector("colorSelector");

variables.forEach(function(v) {
	bindSliderToValue(v);
	bindArrowsToValue(v);
});
