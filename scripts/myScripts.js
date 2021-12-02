input_name = document.getElementById('input-name');

function start_up(){
    //reset objects and ...
    input_name = document.getElementById('input-name');
    input_name.value = "";
    //uncheck radio button
    for (let e of document.getElementsByName('gender')) {
        e.checked = null;
    }

    document.getElementById('predicted-gender').innerHTML = null;
    document.getElementById('predicted-probability').innerHTML = null;
    document.getElementById('results').style.display = 'none';
    document.getElementById('saved').style.display = 'none';
}

window.onload = function() {
    start_up()
};

function check_valid_name(name){
    return /^[A-Za-z ]{1,255}$/.test(name);
}

// onclick event on submit button calls this function.
function submit_func(){
    event.preventDefault();

    //refill the parameter just in case
    input_name = document.getElementById('input-name');
    console.log(input_name)
	if(input_name.value == ""){
		console.log("please enter a name.")
	}
	else{
	    if (!check_valid_name(input_name.value)){
	        console.log("Invalid format.")
	        return;
	    }
	    // show the prediction box
	    document.getElementById('results').style.display = 'block';

	    // get prediction from api
		ans = request_api()
		console.log(ans)
		// parse JSON result
		var data = JSON.parse(ans)
		document.getElementById('predicted-gender').innerHTML = data.gender;
		document.getElementById('predicted-probability').innerHTML = data.probability;

		if(data.gender==null){
		    document.getElementById('predicted-gender').innerHTML = "No Predicted value found";
		}

		if(localStorage.getItem(input_name.value)!=null){
		    // if there are saved results in local storage, show them
		    document.getElementById('saved').style.display = 'block';
		   	document.getElementById('saved-answer-text').innerHTML = localStorage.getItem(input_name.value);

		}
	}

}


function request_api(){
    /*
        Sends request to genderize api using the input-name field's value.
        the response text is returned.
    */
    var xmlHttp = new XMLHttpRequest();
    url = "https://api.genderize.io"
    let params = new URLSearchParams({
            "name": input_name.value
        });
    url += '?' + params.toString()
    xmlHttp.open("GET", url, false);
    xmlHttp.send(null);
    return xmlHttp.responseText;
}

function get_gender_radio_button_value() {
    for (let e of document.getElementsByName('gender')) {
        if (e.checked){
        	//return selected gender
            return e.value;
        }
    }
    //no button is checked
    return null;
}

// onclick event on save button calls this function.
function save_func(){
    /*
        If a radio button choice is selected, That choice is saved in local storage. (overwritten if existed)
        if no choice is selected, the function tries to save the prediction.
         If available, the gender is saved. otherwise, nothing is saved and no changes are made in storage.
    */
    event.preventDefault();

    // also do the prediction as the name field might be changed.
    submit_func()

    if(input_name.value == ""){
    	console.log("please enter a name.")
    	return;
    }
    if (!check_valid_name(input_name.value)){
    	console.log("Invalid format.")
        return;
    }

    selectedGender = get_gender_radio_button_value()
    console.log(selectedGender)

    if(selectedGender == null){
        //save the prediction
        data = JSON.parse(request_api())
        if(data.gender!=null){
            localStorage.setItem(input_name.value, data.gender);
        }
        else{
            console.log("Nothing Selected and no prediction available. nothing was saved.")
            return;
        }
    }
    else{
        localStorage.setItem(input_name.value, selectedGender);
    }

    document.getElementById('saved').style.display = 'block';
    document.getElementById('saved-answer-text').innerHTML = localStorage.getItem(input_name.value);

}


function clear_func(){
    event.preventDefault();

    // also do the prediction as the name field might be changed.
    submit_func()

    if (!check_valid_name(input_name.value)){
    	console.log("Invalid format.")
        return;
    }

    if(localStorage.getItem(input_name.value)!=null){
        localStorage.removeItem(input_name.value)
    }
    else{
        console.log("The inputed name does not exist in the saved database.")
    }
    document.getElementById('saved').style.display = 'none';
}