facebook-query
==============

Facebook's Graph API has a powerful field expansion feature. This lightweight library gives a simple API to their multi-requst, nested request fields.

This is still pre-release code. There are unit tests for all the functions, but function names, function signature, and functionality may change between pre-release versions.

Like any API, do not try an access the properties of any object. All properties have a getter and/or setter.

Installation for Testing
-----------

    npm install

Run Tests
-----------

    grunt karma

Dependencies
-----------

    None for the library itself.
    Testing requires nodejs and grunt.

Usage
-----------

Facebook's Graph API supports nested queries. <https://developers.facebook.com/docs/graph-api/using-graph-api/v2.0#fieldexpansion>
This allows you to get multiple levels of data with a single query instead of doing multiple. For example, lets say you wanted a user's albums, and the first 5 photos in the albums, and the people tagged in them, and you also wanted their last 5 posts. Instead of querying for the albums, and then the photos for each albums, and then the people tagged in each album, and their posts, you could just do a single query like so:
    GET graph.facebook.com/me?
    fields=albums.limit(5).fields(name, photos.limit(2).fields(name, picture, tags.limit(2))),posts.limit(5)

While this is super powerful, it is also somewhat complicated to programmatically build the string, and worse yet, the data response from facebook is nested in a similar, but not always consistent structure. If what you request is a single piece of data like 'name', then it will return as a string. If it is something like 'photos' then it will return in an object similar to
    "photos": {
        "data": [
            {
                "name": "blah",
                "picture": "url"
            },
            {
                "name": "blah",
                "picture": "url"
            }
        ],
        "paging": {
            "cursors": {
                "after": "ZZZxNTIxjM3MTg=",
                "before": "ZZZxNAzk4NDM3MTg="
            },
            "next": "https://graph.facebook.com/v2.0/222/photos?limit=2&fields=name,picture,tags.limit%282%29&access_token=ABCDEFG&after=ZZZxNTIxjM3MTg%3D"
        }
    }
This can quickly become complicated when nesting occurs, and shows a need for an API to build the query and process the response.

Query builder API
-----------
The facebookQuery object contains both query builder and response parser functions, but they are separated here for quick reference.

# Constructor
To start a new query, simply call new facebookQuery(). There is an optional arguement, but this is for internal use only.
## Example
    var oMyQuery = new facebookQuery();

# addField
Add a field to the current query level.
Returns: a new facebookQuery object for the new field
## Example
    var oMyQuery = new facebookQuery();
    oMyQuery.addField("posts");
    var oMyAlbums = oMyQuery.addField("albums");
    // Set fields for albums different than Facebook's defaults
    oMyAlbums.addField("name");
    oMyAlbums.addField("photos");

    oMyQuery.toString(); // fields=posts,albums.fields(name,photos)

# fieldNames
Returns an array of requested field names.
## Example
    var oMyQuery = new facebookQuery();
    oMyQuery.addField("posts");
    oMyQuery.addField("albums");
    oMyQuery.fieldNames(); // ["posts", "albums"]

# fields
This can act as a getter or setter depending on the argument. If an array is given, it will set multiple fields at once. If no argument is given, it will return all the set fields.
## Example
    var oMyQuery = new facebookQuery();
    oMyQuery.fields(["posts", "albums"]);
    oMyQuery.fields(); // [{facebookQuery}, {facebookQuery}]

# getField
Returns a facebookQuery object for the requested field.
## Example
    var oMyQuery = new facebookQuery();
    oMyQuery.fields(["posts", "albums"]);
    var oAlbums = oMyQuery.getField("albums");

# getName
If called on a field, returns the string of the field name. This may be undefined if called on the main facebookQuery object.
## Example
    var oMyQuery = new facebookQuery();
    oMyQuery.fields(["posts", "albums"]);
    oMyQuery.fields()[0].getName(); // "posts"

# limit
* If an argument is given, sets the limit of response objects.
* If no argument it returns what is set.
## Example
    var oMyQuery = new facebookQuery();
    var oPosts = oMyQuery.addField("posts").limit(5);
    oPosts.limit(); // 5

# toJSON
Returns a JSON friendly request structure object.
## Example
    var oMyQuery = new facebookQuery();
    oMyQuery.fields(["posts", "albums"]);
    oMyQuery.getField("albums").limit(2).addField("name");
    JSON.stringify(oMyQuery); // {"fields":[{"name":"posts"},{"fields":[{"name":"name"}],"name":"albums","limit":2}]}

# toString
Returns a string of the query that is ready for Facebook API
## Example
    var oMyQuery = new facebookQuery();
    oMyQuery.fields(["posts", "albums"]);
    oMyQuery.getField("albums").limit(2).addField("name");
    oMyQuery.toString(); // "fields=posts,albums.limit(2).fields(name)"


Response Parser API
-----------
The facebookQuery object contains both query builder and response parser functions, but they are separated here for quick reference.

# data
* If no argument is given it returns the parsed data result
* If an argument is given it returns the parsed data result for the given key. If the requested key is not found it will return undefined.
## Example
    // already parsed response data
    oMyQuery.data('name'); // returns string
    oMyQuery.data('non-existing-key'); // returns undefined
    oMyQuery.data('posts'); // returns array of facebookQuery objects.

# dataFields
Returns an array of fields available from the parsed data. This might be different from the requested fields   if the requested field doesn't exist or if facebook decided to send back extra fields.
## Example
    var oMyQuery.addField('albums');
    // already parsed response data
    oMyQuery.dataFields(); // ['albums', 'id']

# getID
Some data has an associated id. This will return the id if one exists, else undefined.
## Example
     // already parsed response data
    oMyQuery.getID(); // 123

# hasData
Returns true if the facebookQuery has any parsed data.

# paging
Returns the queries paging object.
Returns undefined if a paging object doesn't exist
## Example
    var oMyQuery.addField('albums');
    // already parsed response data
    oMyQuery.data('albums').paging();
    // See https://developers.facebook.com/docs/graph-api/using-graph-api/v2.0#paging

# parseResponse
Enter Facebook's response to populate all fields with the requested data. This will accept JSON string or already parsed JSON object
## Example
    var oMyQuery = new facebookQuery();
    oMyQuery.fields(["name", "posts"]);
    // make request to Facebook
    oMyQuery.parseResponse(oRawResponseFromFacebook);
    oMyQuery.dataFields(); // ["name","posts","id"]

