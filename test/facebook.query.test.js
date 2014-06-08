/**
 * @license Facebook Query API v0.1
 * (c) 2014 Matt Slocum
 * License: MIT
 * Jasmine Tests
 */
(function () {
    'use strict';

    describe("Facebook Query", function() {
        var oQuery;

        beforeEach(function() {
            oQuery = new facebookQuery();
        });

        describe("constructs queries", function() {
            it("single field", function() {
                var oName = oQuery.addField("name");
                expect(oQuery.getField("name")).toEqual(oName);
                expect(oQuery.fields()).toEqual([oName]);
                expect(oQuery.fieldNames()).toEqual(["name"]);
                expect(JSON.stringify(oQuery)).toEqual(JSON.stringify({
                    fields: [
                        {
                            "name": "name"
                        }
                    ]
                }));
                expect(oQuery.toString()).toEqual("fields=name");
            });
            it("two fields", function() {
                var oName = oQuery.addField("name"),
                    oPhotos = oQuery.addField("photos");
                expect(oQuery.getField("name")).toEqual(oName);
                expect(oQuery.getField("photos")).toEqual(oPhotos);
                expect(oQuery.fields()).toEqual([oName, oPhotos]);
                expect(oQuery.fieldNames()).toEqual(["name", "photos"]);
                expect(JSON.stringify(oQuery)).toEqual(JSON.stringify({
                    fields: [
                        {
                            "name": "name"
                        },
                        {
                            "name": "photos"
                        }
                    ]
                }));
                expect(oQuery.toString()).toEqual("fields=name,photos");
            });
            it("three fields", function() {
                var oName = oQuery.addField("name"),
                    oPhotos = oQuery.addField("photos"),
                    oPosts = oQuery.addField("posts");
                expect(oQuery.getField("name")).toEqual(oName);
                expect(oQuery.getField("photos")).toEqual(oPhotos);
                expect(oQuery.getField("posts")).toEqual(oPosts);
                expect(oQuery.fields()).toEqual([oName, oPhotos, oPosts]);
                expect(oQuery.fieldNames()).toEqual(["name", "photos", "posts"]);
                expect(JSON.stringify(oQuery)).toEqual(JSON.stringify({
                    fields: [
                        {
                            "name": "name"
                        },
                        {
                            "name": "photos"
                        },
                        {
                            "name": "posts"
                        }
                    ]
                }));
                expect(oQuery.toString()).toEqual("fields=name,photos,posts");
            });

            it("single field with limit", function() {
                var oPhotos = oQuery.addField("photos").limit(10);
                expect(oPhotos.limit()).toEqual(10);
                expect(JSON.stringify(oQuery)).toEqual(JSON.stringify({
                    fields: [
                        {
                            "name": "photos",
                            "limit": 10
                        }
                    ]
                }));
                expect(oQuery.toString()).toEqual("fields=photos.limit(10)");
            });
            it("two fields with limits", function() {
                var oPhotos = oQuery.addField("photos").limit(10),
                    oPosts = oQuery.addField("posts").limit(5);
                expect(oPhotos.limit()).toEqual(10);
                expect(oPosts.limit()).toEqual(5);
                expect(JSON.stringify(oQuery)).toEqual(JSON.stringify({
                    fields: [
                        {
                            "name": "photos",
                            "limit": 10
                        },
                        {
                            "name": "posts",
                            "limit": 5
                        }
                    ]
                }));
                expect(oQuery.toString()).toEqual("fields=photos.limit(10),posts.limit(5)");
            });

            it("single field with addFields", function() {
                var oPhotos = oQuery.addField("photos"),
                    oName = oPhotos.addField('name'),
                    oPicture = oPhotos.addField('picture');
                expect(oQuery.getField("photos")).toEqual(oPhotos);
                expect(oQuery.fields()).toEqual([oPhotos]);
                expect(oQuery.fieldNames()).toEqual(["photos"]);
                expect(oPhotos.getField("name")).toEqual(oName);
                expect(oPhotos.getField("picture")).toEqual(oPicture);
                expect(oPhotos.fields()).toEqual([oName, oPicture]);
                expect(oPhotos.fieldNames()).toEqual(["name", "picture"]);
                expect(JSON.stringify(oQuery)).toEqual(JSON.stringify({
                    fields: [
                        {
                            "fields": [
                                {
                                    "name": "name"
                                },
                                {
                                    "name": "picture"
                                }
                            ],
                            "name": "photos"
                        }
                    ]
                }));
                expect(oQuery.toString()).toEqual("fields=photos.fields(name,picture)");
            });

            it("multi-depth with options", function() {
                // this url came from FB docs:
                // https://developers.facebook.com/docs/graph-api/using-graph-api/v2.0#fieldexpansion
                var oAlbums = oQuery.addField("albums")
                                    .limit(5)
                                    .fields(["name", "photos"]),
                    oPhotos = oAlbums.getField("photos")
                                     .limit(2)
                                     .fields(["name", "picture", "tags"]);
                oPhotos.getField("tags").limit(2);
                oQuery.addField("posts").limit(5);

                expect(JSON.stringify(oQuery)).toEqual(JSON.stringify({
                    fields: [
                        {
                            "fields": [
                                {
                                    "name": "name"
                                },
                                {
                                    "fields": [
                                        {
                                            "name": "name"
                                        },
                                        {
                                            "name": "picture"
                                        },
                                        {
                                            "name": "tags",
                                            "limit": 2
                                        }
                                    ],
                                    "name": "photos",
                                    "limit": 2
                                }
                            ],
                            "name": "albums",
                            "limit": 5
                        },
                        {
                            "name": "posts",
                            "limit": 5
                        }
                    ]
                }));
                expect(oQuery.toString()).toEqual("fields=albums.limit(5).fields(name,photos.limit(2).fields(name,picture,tags.limit(2))),posts.limit(5)");
            });

            it("multi-depth with options alternative", function() {
                // this url came from FB docs:
                // https://developers.facebook.com/docs/graph-api/using-graph-api/v2.0#fieldexpansion
                oQuery.addField("albums")
                    .limit(5)
                    .fields(["name"])
                    .addField("photos")
                    .limit(2)
                    .fields(["name", "picture"])
                    .addField("tags")
                    .limit(2);
                oQuery.addField("posts").limit(5);

                expect(JSON.stringify(oQuery)).toEqual(JSON.stringify({
                    fields: [
                        {
                            "fields": [
                                {
                                    "name": "name"
                                },
                                {
                                    "fields": [
                                        {
                                            "name": "name"
                                        },
                                        {
                                            "name": "picture"
                                        },
                                        {
                                            "name": "tags",
                                            "limit": 2
                                        }
                                    ],
                                    "name": "photos",
                                    "limit": 2
                                }
                            ],
                            "name": "albums",
                            "limit": 5
                        },
                        {
                            "name": "posts",
                            "limit": 5
                        }
                    ]
                }));
                expect(oQuery.toString()).toEqual("fields=albums.limit(5).fields(name,photos.limit(2).fields(name,picture,tags.limit(2))),posts.limit(5)");
            });
        });

        describe("parses response", function() {
            it("parses response for one field", function() {
                var oResponse = {
                        name: "User",
                        id: "1234"
                    };
                oQuery.addField("name");
                oQuery.parseResponse(oResponse);
                expect(oQuery.data()).toEqual(oResponse);
            });

            it("parses double response for one field", function() {
                var oResponse = {
                    albums: {
                        data: [
                            {
                                name: "album 1",
                                id: "123"
                            },
                            {
                                name: "album 2",
                                id: "124"
                            }
                        ]
                    }
                };
                oQuery.addField("albums");
                oQuery.parseResponse(oResponse);
                expect(oQuery.data("albums")[0].getName()).toEqual("albums");
                expect(oQuery.data("albums")[0].data('name')).toEqual("album 1");
                expect(oQuery.data("albums")[0].data('id')).toEqual("123");
                expect(oQuery.data("albums")[0].getID()).toEqual("123");
                expect(oQuery.data("albums")[0].data()).toEqual({
                    name: "album 1",
                    id: "123"
                });
                expect(oQuery.data("albums")[1].getName()).toEqual("albums");
                expect(oQuery.data("albums")[1].data('name')).toEqual("album 2");
                expect(oQuery.data("albums")[1].data('id')).toEqual("124");
                expect(oQuery.data("albums")[1].getID()).toEqual("124");
                expect(oQuery.data("albums")[1].data()).toEqual({
                    name: "album 2",
                    id: "124"
                });
                expect(oQuery.paging()).toBeUndefined();
            });

            it("parses response nested fields", function() {
                function serverResponse() {
                    return {
                        "albums": {
                            "data": [
                                {
                                    "name": "Album 1",
                                    "id": "2468",
                                    "created_time": "2013-09-01T03:23:45+0000",
                                    "photos": {
                                        "data": [
                                            {
                                                "name": "I like taking photos",
                                                "picture": "https://fbcdn-photos-h-a.akamaihd.net/hphotos-ak-xpf1/v/t34.0-11/123456789.jpg",
                                                "id": "987654",
                                                "created_time": "2014-05-26T20:58:43+0000"
                                            },
                                            {
                                                "name": "Yet another photo",
                                                "picture": "https://fbcdn-photos-b-a.akamaihd.net/hphotos-ak-xfa1/t1.0-0/456789123.jpg",
                                                "id": "456456",
                                                "created_time": "2013-09-01T03:23:47+0000"
                                            }
                                        ],
                                        "paging": {
                                            "cursors": {
                                                "after": "ZZZxNTE3gzOTg3MTg=",
                                                "before": "ZZZxNTI0MOTM3MTg="
                                            }
                                        }
                                    }
                                },
                                {
                                    "name": "iOS Photos",
                                    "id": "222",
                                    "created_time": "2012-10-30T03:12:03+0000",
                                    "photos": {
                                        "data": [
                                            {
                                                "name": "My phone can take pictures",
                                                "picture": "https://fbcdn-photos-c-a.akamaihd.net/hphotos-ak-xpa1/t1.0-0/789789789_s.jpg",
                                                "id": "789789789",
                                                "created_time": "2014-05-21T05:53:52+0000"
                                            },
                                            {
                                                "name": "Photo!!!",
                                                "picture": "https://fbcdn-photos-a-a.akamaihd.net/hphotos-ak-xpa1/t1.0-0/88888888_s.jpg",
                                                "id": "88888888",
                                                "created_time": "2014-02-04T01:33:03+0000"
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
                                }
                            ],
                            "paging": {
                                "cursors": {
                                    "after": "ZZZxNTEyMDjg3MTg=",
                                    "before": "ZZZxNTE3NTM3MTg="
                                },
                                "next": "https://graph.facebook.com/v2.0/10152405535518718/albums?limit=2&fields=name,photos.limit%282%29.fields%28name,picture,tags.limit%282%29%29&access_token=ABCDEFG&after=ZZZxNTEyMDjg3MTg%3D"
                            }
                        },
                        "id": "123456"
                    };
                }
                oQuery.addField("albums")
                    .limit(2)
                    .fields(["name"])
                    .addField("photos")
                    .limit(2)
                    .fields(["name", "picture"])
                    .addField("tags")
                    .limit(2);
                oQuery.addField("posts").limit(2);

                oQuery.parseResponse(serverResponse());

                expect(oQuery.paging()).toEqual(serverResponse().paging);
                expect(oQuery.toString()).toEqual("fields=albums.limit(2).fields(name,photos.limit(2).fields(name,picture,tags.limit(2))),posts.limit(2)");
                expect(oQuery.dataFields()).toEqual(['albums', 'id']);
                expect(oQuery.data('id')).toEqual('123456');
                var aAlbums = oQuery.data('albums');
                expect(aAlbums.length).toEqual(2);
                // TODO: make a generic FB tree walker.
                aAlbums.forEach(function(oAlbum, iIndex) {
                    var aKeys = oAlbum.dataFields();
                    expect(oAlbum.getName()).toEqual('albums');
                    expect(oAlbum.getID()).toEqual(serverResponse().albums.data[iIndex].id);
                    expect(aKeys).toEqual(['name', 'id', 'created_time', 'photos']);
                    expect(oAlbum.paging()).toEqual(serverResponse().albums.data[iIndex].paging);
                    aKeys.forEach(function(strKey) {
                        if (strKey == 'photos') {
                            oAlbum.data(strKey).forEach(function(oPhoto, iPhotoIndex) {
                                expect(oPhoto.getName()).toEqual(strKey);
                                expect(oPhoto.getID()).toEqual(serverResponse().albums.data[iIndex][strKey].data[iPhotoIndex].id);
                                expect(oPhoto.dataFields()).toEqual(['name', 'picture', 'id', 'created_time']);
                                expect(oPhoto.data()).toEqual(serverResponse().albums.data[iIndex][strKey].data[iPhotoIndex]);
                            });
                        } else {
                            expect(oAlbum.data(strKey)).toEqual(serverResponse().albums.data[iIndex][strKey]);
                        }
                    });
                });
            });
        });
    });
})();
