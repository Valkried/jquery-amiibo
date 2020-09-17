$(function() {
    // 2 URLs are created in order to handle issues from the API
    const distantFullListUrl = 'https://www.amiiboapi.com/api/amiibo';
    const localFullListUrl = 'http://127.0.0.1:8080/assets/amiibo-local/amiibo-array.json';
    
    main(distantFullListUrl);

    /**
     * Gets all the amiibos' data, adds list items to the navigation, allows to expand/reduce list panels and add images in the main section, on click.
     * @param urlAPI (Local or distant URLs can be passed)
     */
    function main(urlAPI) {
        // Build the navigation list
        addListItems('types', 'type');
        addListItems('series', 'amiiboseries');
        addListItems('characters', 'character');

        // Bind a click event on all list titles (<h2>)
        $('h2').click(function() {
            // If the clicked <h2> doesn't have a "data-active" attribute
            if (!$(this).attr('data-active')) {
                // Add a "data-active" attribute to it, then show its list items
                $(this).attr('data-active', true).next().slideDown();
                // Remove the "data-active" attribute from every other <h2>, then hide all list items except for the clicked <h2>
                $('h2').not(this).removeAttr('data-active').next().slideUp();
            }
        });

        // Call the API to get all the amiibos (first with the distant URL, then with the local one if the request fails)
        $.get(urlAPI, function(amiiboFullArray) {
            // Bind a click event on all list items (<li>)
            $('nav').on('click', 'li', function() {
                // Remove everything from the main section
                $('main').empty();

                // Create a filtered array from the full list of amiibos
                const filteredAmiibo = amiiboFullArray.amiibo.filter(
                    // Check the "data-filter" attribute of the nav-section element in order to find the correct key
                    // For example, if we want to get a Figure amiibo from the Type list :
                    // We click on the <li>Figure</li> (so "$(this).text()" is "Figure")
                    // The "data-filter" attribute of the Type list is "type", because in the data received from the API, amiibo.type returns the type (like "Figure")
                    // So, we can compare the clicked type (e.g "Figure") to the amiibos' type, and add it to the filtered array
                    amiibo => amiibo[$(this).parent().parent().attr('data-filter')] === $(this).text()
                );
        
                filteredAmiibo.forEach(amiibo => {
                    // For each amiibo from the filtered array, add its image to the main section
                    $('main').append(`<img src="${amiibo.image}" alt=${amiibo.character} >`)
                });
            });
        }).fail(function() {
            // If the request fails (e.g : API crashes), reload it with the local URL
            main(localFullListUrl);
        });
    }

    /**
     * Calls the API to get all list items, and appends the data to a list located into the target container.
     * @param target (Must be the #id of a nav-section in the HTML. The target element must have a <ul> direct child)
     * @param url (The URL associated to the target : you can get it from the API's documentation)
     */
    function addListItems(target, url) {
        // Call the API
        $.get('https://www.amiiboapi.com/api/' + url, function(response) {
            response.amiibo.forEach(element => {
                // For each data, add a <li> to a <ul> into the target container
                $(`#${target} ul`).append(`<li>${element.name}</li>`);
            });
        });
    }
});
