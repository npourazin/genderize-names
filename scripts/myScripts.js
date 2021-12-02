input_name = document.getElementById('input-name');

// -------------    RESET FUNCTION    -----------------

// this function is used on startups or resets
function start_up(){
    //reset input name
    input_name = document.getElementById('input-name');
    input_name.value = "";

    //uncheck radio button
    for (let e of document.getElementsByName('gender')) {
        e.checked = null;
    }

    //reset shown gender and probability values to null
    document.getElementById('predicted-gender').innerHTML = null;
    document.getElementById('predicted-probability').innerHTML = null;

    document.getElementById('results').style.display = 'none';
    document.getElementById('saved').style.display = 'none';

    // reset the status pop-up
    document.getElementById('pop-up-message').style.display = 'none';
    document.getElementById('pop-up-message').innerHTML = null;
}


// on each refreshing or loading of the page, we reset the state to start_up state
window.onload = function() {
    start_up()
};


// -------------    FUNCTIONS TO BE USED IN EVENT LISTENERS    -----------------


// send a GET request with input-name as query to https://api.genderize.io
function request_api(){
    /*
        Sends request to genderize api using the input-name field's value as a 'name' query.
        the response text is returned (the format is so that it can be parsed as JSON if needed).
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


//return the value of the radio button, whether it is once of the choices(the genders) or nothing is selected(null)
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


//The two conditions of the input-name are checked here:
//1- It must contain between 1 - 22 characters
//2- It should only contain either whitespaces or alphabet letters(whether Capital case or lower case)
function check_valid_name(name){
    return /^[A-Za-z ]{1,255}$/.test(name);
}


// -------------    EVENT LISTENERS    -----------------


// onclick event on submit button calls this function.
function submit_func(){
    /*
     side note:
     This function is run at the start of both save and clear button event listeners
     and is used because if we don't do this, we either have some duplication or we might have errors.
     one of the simple examples is that if we don't fetch and check the validity of the input-name on each event,
     it might be changed and we might not notice. When we think about this scenario,
     It might not make sense to click a button like clear after somehow changing the text and not submitting it,
     but also it should be somehow handled, which the following implementation makes sure that no such thing goes wrong.
    */

    event.preventDefault();

    //first remove both displays
    document.getElementById('results').style.display = 'none';
    document.getElementById('saved').style.display = 'none';
    // reset the status pop-up
    document.getElementById('pop-up-message').style.display = 'none';
    document.getElementById('pop-up-message').innerHTML = null;

    //refill the parameter, just in case
    input_name = document.getElementById('input-name');

    console.log(input_name)
	if(input_name.value == "" || !check_valid_name(input_name.value)){
	    tmp = input_name.value

        //reset to startup state
        start_up()

	    if(tmp == ""){
	        console.log(EMPTY_NAME_FIELD_MESSAGE)
            document.getElementById('pop-up-message').innerHTML = EMPTY_NAME_FIELD_MESSAGE;
         }
	    else{
	        console.log(INVALID_NAME_MESSAGE)
	        document.getElementById('pop-up-message').innerHTML = INVALID_NAME_MESSAGE;
	    }

	    document.getElementById('pop-up-message').style.display = 'block';

        //re-show the result box and hide prediction
        document.getElementById('prediction').style.display = 'none';
        document.getElementById('results').style.display = 'block';

		return null;
	}
	else{
	    //Here, we have a valid name, ready to be sent as a GET request's query.

	    // show the results and the prediction box
	    document.getElementById('prediction').style.display = 'block';
	    document.getElementById('results').style.display = 'block';

	    // get prediction from api
		ans = request_api()
		console.log(ans)

		// parse JSON result
		var data = JSON.parse(ans)

		/*
		side note:
		here we could have a defined-js-object in which we would store this data.
		the reason that only the parsed version is used is there was no need for a more complicated struct!
		also, had we kept the data in any sort of global object, problems with consistency might have occurred,
		So it is better to keep this data locally and fetch it again when needed again after checking the input_name field again.
		Of course, defining objects explicitly and also maybe adding some methods to them,
		for keeping data in a JS object is a good and easy method in many cases,
		but simply parsing and keeping and using the parsed object seems to be better in this case.
        */

		//put the values on corresponding <p> tags
		document.getElementById('predicted-gender').innerHTML = data.gender;
		document.getElementById('predicted-probability').innerHTML = data.probability;

		if(data.gender==null){
		    //if the gender could not be determined by genderize api.
		    document.getElementById('predicted-gender').innerHTML = NO_PREDICTION_MESSAGE;
		}

		if(localStorage.getItem(input_name.value)!=null){
		    // if there are saved results in local storage, show them
		    document.getElementById('saved').style.display = 'block';
		   	document.getElementById('saved-answer-text').innerHTML = localStorage.getItem(input_name.value);

		}
	}
    return 0;
}

// onclick event on save button calls this function.
function save_func(){
    /*
        If a radio button choice is selected, That choice is saved in local storage. (overwritten if it exists)
        If no choice is selected, the function tries to save the prediction.
            If available, the predicted gender is saved (Again, overwritten if it exists).
            Otherwise, nothing is saved and no changes are made in storage.
    */

    event.preventDefault();

    // also do the prediction as the name field might be changed.
    if (submit_func()==null){
        return;
    }

    selectedGender = get_gender_radio_button_value()
    console.log(selectedGender)

    if(selectedGender == null){
        //No choice selected, so we save the prediction.

        //fetch the prediction
        data = JSON.parse(request_api())
        if(data.gender!=null){
            // found a prediction, we save it.
            localStorage.setItem(input_name.value, data.gender);
        }
        else{
            // There is also no prediction to save so we show suitable messages and then do nothing with the storage.
            console.log(SAVE_ERROR_MESSAGE)
            document.getElementById('pop-up-message').style.display = 'block';
            document.getElementById('pop-up-message').innerHTML = SAVE_ERROR_MESSAGE;
            return;
        }
    }
    else{
        // We just put the selected gender in the storage as the value for the input-name.
        localStorage.setItem(input_name.value, selectedGender);
    }

    document.getElementById('saved').style.display = 'block';
    document.getElementById('saved-answer-text').innerHTML = localStorage.getItem(input_name.value);

}

// onclick event on clear button calls this function.
function clear_func(){
    /*
        Removes the input name (and it's saved gender) from the local storage.
        If no such name exists in the database, shows suitable messages and does nothing with the storage.
    */

    event.preventDefault();

    // also do the prediction as the name field might be changed.
    if (submit_func()==null){
        return;
    }

    if(localStorage.getItem(input_name.value)!=null){
        // This input-name exists as a key in the local storage, so we remove it's entry.
        localStorage.removeItem(input_name.value)
    }
    else{
        // There is no such record saved, so we show suitable messages and then do nothing with the storage.
        console.log(REMOVE_ERROR_MESSAGE)
        document.getElementById('pop-up-message').style.display = 'block';
        document.getElementById('pop-up-message').innerHTML = REMOVE_ERROR_MESSAGE;
    }

    // as the saved answer was shown, we remove it's display
    document.getElementById('saved').style.display = 'none';
}