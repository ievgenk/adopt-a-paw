// 831e7bdec6900fcd456fd38ddb8ba34d API key  -- Petfinder
// AIzaSyAR6_jdyKWQCb3VYusDt95oE39dDgDIpdA   -- Google Maps JS API


//DOM VALUES
let renderDiv = document.querySelector('.results');
let breedInput = document.getElementById('pet-search');
//VALUES


let yieldedAdresses = [];
let refinedAddresses = [];
let addressGeoCode = [];
//Breed Suggestions
let allBreedsArray = [];
new Awesomplete(breedInput, {
  list: allBreedsArray
})


//FUNCTIONS//


function getAddresses(data) {
  let address = data.petfinder.pets.pet
  address.map(pet => {
    yieldedAdresses.push({
      "address": pet.contact.address1,
      "city": pet.contact.city,
      "state": pet.contact.state,
      "zip": pet.contact.zip
    })
  })
}

function refineAddresses() {
  yieldedAdresses.map(result => {
    if (result.address.$t == null) {
      refinedAddresses.push({
        city: result.city.$t,
        state: result.state.$t,
        zip: result.zip.$t
      })
    } else {
      refinedAddresses.push({
        address: result.address.$t,
        city: result.city.$t,
        state: result.state.$t,
        zip: result.zip.$t
      })
    }
  })
}

function getAllBreeds() {
  $.ajax({
    url: `http://api.petfinder.com/breed.list?key=831e7bdec6900fcd456fd38ddb8ba34d&animal=dog&format=json&callback=?`,
    type: `GET`,
    dataType: `json`,
    success: function (response) {
      response.petfinder.breeds.breed.map(dogs => allBreedsArray.push(dogs.$t));
      return allBreedsArray;
    }
  })
}

function geoCodeAddress() {
  for (let i = 0; i < yieldedAdresses.length; i++) {
    if (refinedAddresses[i].address === undefined) {
      $.ajax({
        url: `https://maps.googleapis.com/maps/api/geocode/json?key=AIzaSyAR6_jdyKWQCb3VYusDt95oE39dDgDIpdA&address=${refinedAddresses[i].city} ${refinedAddresses[i].state} ${refinedAddresses[i].zip}`,
        type: 'GET',
        dataType: 'json'
      }).done(function (geoCode) {
        addressGeoCode.push(geoCode.results[0].geometry.location);
      })
    } else {
      $.ajax({
        url: `https://maps.googleapis.com/maps/api/geocode/json?key=AIzaSyAR6_jdyKWQCb3VYusDt95oE39dDgDIpdA&address=${refinedAddresses[i].address} ${refinedAddresses[i].city} ${refinedAddresses[i].state} ${refinedAddresses[i].zip}`,
        type: 'GET',
        dataType: 'json'
      }).done(function (geoCode) {
        addressGeoCode.push(geoCode.results[0].geometry.location);
      })
    }

  }

}

function renderPets(data) {
  let pets = data.petfinder.pets.pet;
  let renderDivHtml = ``;
  for (let i = 0; i < yieldedAdresses.length; i++) {
    renderDivHtml +=
      `<ul>
      <li>Age: ${pets[i].age.$t}</li>
      <li>Description ${pets[i].description.$t}</li>
      </ul>`
  }
  renderDiv.innerHTML = renderDivHtml;
}



$(function () {

  //Getting all of the dog breeds

  getAllBreeds();

  //Submit Initial Request to fetch Dogs according to the search inputs

  $('form').on('submit', function (event) {
    let breedName = $('#pet-search').val();
    let postalCode = $('#postal').val();
    event.preventDefault();
    $('#pet-search').val('');
    $('#postal').val('');
    sendPetFinderRequest(breedName, postalCode);
  })

  function sendPetFinderRequest(breed, postalCode) {
    $.ajax({
        url: `http://api.petfinder.com/pet.find?callback=?`,
        data: {
          key: `831e7bdec6900fcd456fd38ddb8ba34d`,
          animal: `dog`,
          breed: breed,
          location: postalCode,
          format: `json`,
          count: 5
        },
        type: "GET",
        dataType: "json"
      })
      .done(function (data) {
        console.log(data)
        getAddresses(data);
        refineAddresses();
        renderPets(data);
        geoCodeAddress();
      })
  }

})