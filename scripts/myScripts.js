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

function check_valid_name(name){
    return /^[A-Za-z ]{1,255}$/.test(name);
}

// -------------    EVENT LISTENERS    -----------------

// onclick event on submit button calls this function.
function submit_func(){
    event.preventDefault();

    //first remove both displays
    document.getElementById('results').style.display = 'none';
    document.getElementById('saved').style.display = 'none';
    // reset the status pop-up
    document.getElementById('pop-up-message').style.display = 'none';
    document.getElementById('pop-up-message').innerHTML = null;

    //refill the parameter just in case
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
	    // show the prediction box
	    document.getElementById('prediction').style.display = 'block';
	    document.getElementById('results').style.display = 'block';

	    // get prediction from api
		ans = request_api()
		console.log(ans)

		// parse JSON result
		var data = JSON.parse(ans)

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
        If a radio button choice is selected, That choice is saved in local storage. (overwritten if existed)
        if no choice is selected, the function tries to save the prediction.
         If available, the gender is saved. otherwise, nothing is saved and no changes are made in storage.
    */

    event.preventDefault();

    // also do the prediction as the name field might be changed.
    if (submit_func()==null){
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
            console.log(SAVE_ERROR_MESSAGE)
            document.getElementById('pop-up-message').style.display = 'block';
            document.getElementById('pop-up-message').innerHTML = SAVE_ERROR_MESSAGE;
            return;
        }
    }
    else{
        localStorage.setItem(input_name.value, selectedGender);
    }

    document.getElementById('saved').style.display = 'block';
    document.getElementById('saved-answer-text').innerHTML = localStorage.getItem(input_name.value);

}

// onclick event on clear button calls this function.
function clear_func(){
    /*
        Removes the input name (and it's saved gender) from the local storage.
        If no such name exists in the database, does nothing.
    */

    event.preventDefault();

    // also do the prediction as the name field might be changed.
    if (submit_func()==null){
        return;
    }

    if(localStorage.getItem(input_name.value)!=null){
        localStorage.removeItem(input_name.value)
    }
    else{
        console.log(REMOVE_ERROR_MESSAGE)
        document.getElementById('pop-up-message').style.display = 'block';
        document.getElementById('pop-up-message').innerHTML = REMOVE_ERROR_MESSAGE;
    }
    document.getElementById('saved').style.display = 'none';
}