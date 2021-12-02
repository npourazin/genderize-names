input_name = document.getElementById('input-name');



function submit_func(){
    event.preventDefault();

    //refill the parameter just in case
    input_name = document.getElementById('input-name');
    console.log(input_name)
	if(input_name.value == ""){
		console.log("please enter a name.")
	}
	else{
	    // show the prediction box
	    document.getElementById('results').style.display = 'block';

	    // get prediction from api
		ans = request_api()
		console.log(ans)
		var data = JSON.parse(ans)
		document.getElementById('predicted-gender').innerHTML = data.gender;
		document.getElementById('predicted-probability').innerHTML = data.probability;

		if(data.gender==null){
		    document.getElementById('predicted-gender').innerHTML = "No Predicted value found";
		}

//		if(){
//		    // if there are saved results in local storage, show them
//		    document.getElementById('saved').style.display = 'block';
//		   	document.getElementById('saved-answer-text').innerHTML = ;
//
//		}
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