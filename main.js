$(function() {
    // 2 URLs are created in order to handle issues from the API
    const distantServerPath = 'https://www.amiiboapi.com';

    main(distantServerPath + '/api/amiibo');

    /**
     * Gets all the amiibos' data, adds list items to the navigation, allows to expand/reduce list panels and add images in the main section, on click.
     * @param urlAPI (Local or distant URLs can be passed)
     */
    function main(urlAPI) {
        // Close all nav item
        $('h2').removeAttr('data-active').next().slideUp();

        // Build the navigation list
        addListItems('types', 'type');
        $('#types').slideDown(); // Open only "type" in nav on startup
        addListItems('amiiboSeries', 'amiiboseries');
        addListItems('gameSeries', 'gameseries');
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
                // Remove src attribute  from all images to stop all image loading
                $("img").removeAttr("src");
                // Remove everything from the main section
                $('.main').empty();

                // Create a filtered array from the full list of amiibos
                const filteredAmiibo = amiiboFullArray.amiibo.filter(
                    // Check the "data-filter" attribute of the list element in order to find the correct key
                    // For example, if we want to get a Figure amiibo from the Type list :
                    // We click on the <li>Figure</li> (so "$(this).text()" is "Figure")
                    // The "data-filter" attribute of the Type list is "type", because in the data received from the API, amiibo.type returns the type (like "Figure")
                    // So, we can compare the clicked type (e.g "Figure") to the amiibos' type, and add it to the filtered array
                    amiibo => amiibo[$(this).parent().attr('data-filter')] === $(this).text()
                );

                $('.title').html($(this).parent().parent().find('h2').text() + " / " + $(this).text());

                filteredAmiibo.forEach((amiibo, index) => {
                    // For each amiibo from the filtered array, add its image to the main section
                    $('.main').append(
                      `<img
                        id="img_${$(this).parent().attr("id")}_${index}"
                        src="${amiibo.image}"
                        alt=${amiibo.character}
                        style="display: none"
                      >`
                    );
                    // For each added images, show it only when content is loaded
                    $(`#img_${$(this).parent().attr("id")}_${index}`).bind("load", function () { $(this).fadeIn(1000);});
                    // Add effect when mouse enter on image
                    $(`#img_${$(this).parent().attr("id")}_${index}`).mouseenter(function(){
	                     $(this).addClass("change");
                    });
                    // Remove effect when mouse leave on image
                    $(`#img_${$(this).parent().attr("id")}_${index}`).mouseleave(function(){
                        $(this).removeClass("change");
                    });
                });
            });
        }).fail(function() {
            const localFullListUrl = 'http://127.0.0.1:8080/assets/amiibo-local/amiibo-array.json';
            // If the request fails (e.g : API crashes), reload it with the local URL
            main(localFullListUrl);
        });
    }

    /**
     * Calls the API to get all list items, and appends the data to a list located into the target container.
     * @param target (Must be the #id of a <ul> in the HTML)
     * @param url (The URL associated to the target : you can get it from the API's documentation)
     */
    function addListItems(target, url) {
        // Call the API
        $.get(distantServerPath + '/api/' + url, function(response) {
            response.amiibo.forEach(element => {
                // For each data, add a <li> to a <ul> into the target container
                $(`#${target}`).append(`<li>${element.name}</li>`);
            });
        });
    }
});
