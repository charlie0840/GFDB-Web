$(document).ready(function () {
    game.init();
    i18next
        .use(i18nextBrowserLanguageDetector)
        .use(i18nextXHRBackend)
        .init({
            backend: {
                loadPath: "locales/{{lng}}/{{ns}}.json",
                parse: (data) => JSON.parse(data)
            },
            whitelist: ["zh-CN", "zh-TW", "ko-KR", "en-US"],
            load: "currentOnly",
            //debug: true,
            fallbackLng: "zh-CN"
        }, function (err, t) {
            jqueryI18next.init(i18next, $);
            $("[data-i18n]").localize();
            document.title = $.t("title");
            setup_page();

            $("#language").change(function () {
                i18next.changeLanguage($("#language").val(), function (err, t) {
                    location.reload();
                });
            });
        });

    i18next.on('languageChanged', function (lng) {
        $("#language").val(lng);
    });
});

class Person {
    constructor(name, num, range, mobility, x, y) {
        this.name = name;
        this.skin = name;
        this.range = range;
        this.mobility = mobility;
        this.x = x;
        this.y = y;
        this.num = num;
    }
};

function setup_page() {
    var characterArray = [];

    var setup_done = false;

    var map_tbl_sort = new Tablesort(document.getElementById("map_table"));
    var team_tbl_sort = new Tablesort(document.getElementById("team_table"));

    var mission_info, spot_info, enemy_team_info, enemy_in_team_info;
    var enemy_character_type_info, campaign_info, gun_info, ally_team_info;
    $.when(
        $.getJSON("jsons/mission_info.json", function (data) {
            mission_info = data;
        }),
        $.getJSON("jsons/spot_info.json", function (data) {
            spot_info = data;
        }),
        $.getJSON("jsons/enemy_team_info.json", function (data) {
            enemy_team_info = data;
        }),
        $.getJSON("jsons/enemy_in_team_info.json", function (data) {
            enemy_in_team_info = data;
        }),
        $.getJSON("jsons/enemy_character_type_info.json", function (data) {
            enemy_character_type_info = data;
        }),
        $.getJSON("jsons/campaign_info.json", function (data) {
            campaign_info = data;
        }),
        $.getJSON("jsons/gun_info.json", function (data) {
            gun_info = data;
        }),
        $.getJSON("jsons/ally_team_info.json", function (data) {
            ally_team_info = data;
        })
    ).then(function () {
        //gai
        map.init(mission_info, spot_info, enemy_team_info, enemy_character_type_info, gun_info, ally_team_info);

        $.each(campaign_info, function (id, campaign) {
            var type_text;
            switch (campaign.type) {
                case 0:
                    type_text = $.t("campaign.main");
                    break;
                case 1:
                    type_text = $.t("campaign.event");
                    break;
                case 2:
                    type_text = $.t("campaign.simulation");
                    break;
                default:
                    type_text = "？？";
            }
            var campaign_text = type_text + " " + $.t(campaign.name);
            $("#campaign_select").append($("<option>")
                .attr("value", campaign.id)
                .text(campaign_text));
        });

        $.each(enemy_team_info, function (id, team) {
            var team_id = team.id;
            if (team_id > 0)
                $("#team_select").append($("<option>")
                    .attr("value", team_id)
                    .text(team_id));
        });

        $("#campaign_select").change(function () {
            $("#map_select").empty();
            var campaign_id = Number($("#campaign_select").val());
            localStorage.setItem("campaign_select", campaign_id);
            $.each(campaign_info[campaign_id].mission_ids, function (index, mission_id) {
                var mission = mission_info[mission_id];
                var mission_text = mission.index_text + " " + $.t(mission.name);
                $("#map_select").append($("<option>")
                    .attr("value", mission.id)
                    .text(mission_text));
            });
            if (setup_done)
                $("#map_select").change();
        });

        $("#map_select").change(function () {
            $("#map_table tbody").empty();
            var mission_id = Number($("#map_select").val());
            localStorage.setItem("map_select", mission_id);
            $.each(mission_info[mission_id].enemy_team_count, function (enemy_team_id, enemy_team_count) {
                var enemy_team = enemy_team_info[enemy_team_id];
                var count_dict = {};        

                $.each(enemy_team.member_ids, function (index, member_id) {
                    var name = $.t(enemy_in_team_info[member_id].enemy_character.name);
                    count_dict[name] = (count_dict[name] || 0) + enemy_in_team_info[member_id].number;
                });
                var members = "";
                $.each(count_dict, function (key, value) {
                    members += key + "*" + value + " ";
                });
                var drops = "";
                $.each(enemy_team.drops, function (index, drop) {
                    drops += $.t(drop) + " ";
                });


                $("<tr>").append(
                    $("<td>").text(enemy_team_id).attr("data-team_id", enemy_team_id),
                    $("<td>").text($.t(enemy_character_type_info[enemy_team.enemy_leader].name)),
                    $("<td>").text(enemy_team.difficulty),
                    $("<td>").text(members),
                    $("<td>").text(enemy_team_count),
                    $("<td>").text(drops)
                ).appendTo("#map_table");
            });
            map_tbl_sort.refresh();

            $("#map_table tbody tr").click(function () {
                $(".table-success").removeClass("table-success");
                $(this).addClass("table-success");
                var enemy_team_id = $("[data-team_id]", this).html();
                if ($("#team_select").val() != enemy_team_id) {
                    $("#team_select").val(enemy_team_id).change();
                }
            });

            if ($("#auto_generate_map_btn").hasClass("active")) {
                //map.generate();
            } else {
                //map.remove();
            }

            if (setup_done)
                $("#map_table tbody tr").first().click();
        });

        $("#team_select").change(function () {
            $("#team_table tbody").empty();
            var team_id = Number($("#team_select").val());
            localStorage.setItem("team_select", team_id);
            characterArray = [];
            $.each(enemy_team_info[team_id].member_ids, function (index, member_id) {

                var member = enemy_in_team_info[member_id];
                var character = member.enemy_character;

                //game.girls.load(character.code, character.code, gameCanvas);
                //gameCanvas.addRole(gameCanvas.skeletonData);
                //gameCanvas.stage.addChild()
                //var data = gameCanvas.skeletonData;
                var person = new Person(character.code, character.number, character.range,
                    character.speed, member.coordinator_x, member.coordinator_y);

                characterArray[characterArray.length] = person;
                $("<tr>").append(
                    $("<td>").text($.t(character.name)),
                    $("<td>").text(character.number),
                    $("<td>").text(Math.ceil(character.maxlife / character.number)),
                    $("<td>").text(character.pow),
                    $("<td>").text(character.rate),
                    $("<td>").text(character.hit),
                    $("<td>").text(character.dodge),
                    $("<td>").text(character.range),
                    $("<td>").text(character.speed),
                    $("<td>").text(character.armor_piercing),
                    $("<td>").text(character.armor),
                    $("<td>").text(member.coordinator_x),
                    $("<td>").text(member.coordinator_y),
                    $("<td>").text($.t(character.character).replace(new RegExp("//c", "g"), " "))
                ).appendTo("#team_table");
            });
            gameCanvas.roles.slice(0, gameCanvas.roles.length);
            gameCanvas.roles = characterArray.slice();
            
            document.getElementById("debug").value = gameCanvas.roles.length;
            team_tbl_sort.refresh();
        });

        $("#generate_map_btn").click(function () {
            // map.generate();
        });

        $("#auto_generate_map_btn").click(function () {
            $(this).toggleClass("active");
            var auto_gen = $(this).hasClass("active");
            localStorage.setItem("auto_generate_map", auto_gen);
            if (auto_gen)
                $("#generate_map_btn").click();
        });

        $("#download_map_btn").click(function () {
            //map.download();
        });

        var storage_val = localStorage.getItem("auto_generate_map") === "true";
        if (storage_val) {
            $("#auto_generate_map_btn").addClass("active");
        }

        storage_val = Number(loadStorageItem("campaign_select", 1));
        $("#campaign_select").val(storage_val).change();

        storage_val = Number(loadStorageItem("map_select", 5));
        if ($("#map_select option[value=" + storage_val + "]").length > 0)
            $("#map_select").val(storage_val);
        $("#map_select").change();

        storage_val = Number(loadStorageItem("team_select", 1));
        var tmp = $("#map_table tbody td[data-team_id=" + storage_val + "]");
        if (tmp.length > 0) {
            tmp.parent().click();
        } else {
            $("#map_table tbody tr").first().click();
        }

        var setup_done = true;
    });

    //game canvas

}

var game = {
    init: function () {
        game.girls = new Girls("character/");
        game.background = ["Airport", "Bridge", "Forest", "IceLake", "Snow", "Street"];
        gameCanvas.init();
        //gameCanvas.selectBackground.val('Airport').change();
        if (typeof defaultStageData !== 'undefined') {
            game.loadStage(defaultStageData);
            stageLoaded = true;
        }
        if (window.location.hash && stageLoaded == false) {
            var hash = window.location.hash.substring(1);
            game.loadStage(hash);
            stageLoaded = true;
            //var defaulutStageData = JSON.parse(decodeURIComponent(hash));
        }
    },

    setGameCanvasHandler: function (handler) {
        gameCanvas.handler = handler;
    },

    loadStage: function (jsonString) {
        var defaulutStageData = JSON.parse(decodeURIComponent(jsonString));
        if (defaultStageData.ro) {
            for (i in defaultStageData.ro) {
                var role = defaultStageData.ro[i];
                game.girls.loadAsync(role.name.role.skin, gameCanvas);
            }
            game.girls.loadAll(defaultStageData.ro);
        }
    }
};


var gameCanvas = {
    roles: [],
    characters: [],
    enemyRole: [],
    grid: [],
    bgImage: [],
    handler: null,
    text: "",
    init: function () {
        gameCanvas.canvas = $('.gameCanvast');
        gameCanvas.selectBackground = $(".gameSelectBackground > select");
        gameCanvas.showFPS = $(".gameShowFPS > input");
        gameCanvas.addGrid = $(".addGrid");
        gameCanvas.addCharacters = $(".addCharacter");
        gameCanvas.hasGrid = false;
        gameCanvas.hasCharacter = false;
        gameCanvas.isShowFPS = true;



        var stringBackground = "<option>Empty</option>";
        for (var i = 0; i < game.background.length; i++) {
            stringBackground += "<option>" + game.background[i] + "</option>";
        }
        gameCanvas.selectBackground.html(stringBackground);

        gameCanvas.selectBackground.change(function () {
            gameCanvas.changeBackground(this.selectedIndex);
        });

        gameCanvas.showFPS.change(function () {
            gameCanvas.isShowFPS = this.checked;
        });

        gameCanvas.addGrid.click(function () {

            if (gameCanvas.hasGrid) {
                gameCanvas.addGrid.html("添加网格");
                gameCanvas.hasGrid = false;
                for (var i = 0; i < gameCanvas.grid.length; i++) {
                    gameCanvas.stage.removeChild(gameCanvas.grid[i]);
                }
                gameCanvas.grid.splice(0, gameCanvas.grid.length - 1);

            }
            else {
                gameCanvas.addGrid.html("移除网格");
                gameCanvas.hasGrid = true;

                class Line extends PIXI.Graphics {
                    constructor(points) {
                        super();
                        this.lineStyle(8, 0x000000);
                        this.moveTo(points[0], points[1]);
                        this.lineTo(points[2], points[3]);
                    }
                }
                var line1 = new Line([105, 90, 1815, 90]);
                var line2 = new Line([105, 1000, 1815, 990]);
                var line3 = new Line([105, 90, 105, 990]);
                var line4 = new Line([1815, 90, 1815, 990]);
                var line5 = new Line([390, 90, 390, 990]);
                var line6 = new Line([675, 90, 675, 990]);
                var line7 = new Line([960, 90, 960, 990]);
                var line8 = new Line([1245, 90, 1245, 990]);
                var line9 = new Line([1530, 90, 1530, 990]);
                var line10 = new Line([105, 390, 1815, 390]);
                var line11 = new Line([105, 690, 1815, 690]);

                gameCanvas.stage.addChild(line1);
                gameCanvas.stage.addChild(line2);
                gameCanvas.stage.addChild(line3);
                gameCanvas.stage.addChild(line4);
                gameCanvas.stage.addChild(line5);
                gameCanvas.stage.addChild(line6);
                gameCanvas.stage.addChild(line7);
                gameCanvas.stage.addChild(line8);
                gameCanvas.stage.addChild(line9);
                gameCanvas.stage.addChild(line10);
                gameCanvas.stage.addChild(line11);
                gameCanvas.grid.push(line1);
                gameCanvas.grid.push(line2);
                gameCanvas.grid.push(line3);
                gameCanvas.grid.push(line4);
                gameCanvas.grid.push(line5);
                gameCanvas.grid.push(line6);
                gameCanvas.grid.push(line7);
                gameCanvas.grid.push(line8);
                gameCanvas.grid.push(line9);
                gameCanvas.grid.push(line10);
                gameCanvas.grid.push(line11);
            }
        });

        gameCanvas.addCharacters.click(function () {
            //document.getElementById("debug").value = gameCanvas.roles.length;
            if (gameCanvas.hasCharacter) {
                gameCanvas.addCharacters.html("添加角色");
                game.girls.loadCache = [];
                game.girls.spineData = [];
                gameCanvas.hasCharacter = false;
                for (var i = 0; i < gameCanvas.characters.length; i++) {
                    gameCanvas.stage.removeChild(gameCanvas.characters[i]);
                }
                gameCanvas.characters.splice(0, gameCanvas.characters.length - 1);

            }
            else {
                gameCanvas.addCharacters.html("移除角色");
                gameCanvas.hasCharacter = true;
                var len = gameCanvas.roles.length;
                for (var i = 0; i < len; i++) {

                    var currRoleData = gameCanvas.roles[i];
                    console.log("" + i + ": " + currRoleData.name + " with size " + gameCanvas.roles.length);
                    //var animName = gameCanvas.spine.spineData.animations[0].name;
                    //gameCanvas.spine.state.setAnimationByName(0, animName, true, 0);
                    //gameCanvas.spine.update(0);
                    //gameCanvas.skeletonData.x = 1000;
                    //gameCanvas.skeletonData.y = 500;
                    //gameCanvas.skeletonData.scale = 2000;
                    //testStr+=i + " " + gameCanvas.skeletonData.name + " " + currRole.x + " " + currRole.y + "; ";
                    //gameCanvas.text+=i + " " + gameCanvas.skeletonData.name + " " + currRole.x + " " + currRole.y + "; ";
                    //document.getElementById("debug").value = testStr;


                    gameCanvas.loadCharacter(currRoleData);

                    //gameCanvas.addRole(currRoleData);
                }
                console.log("load all!!!!!!!!!!!!!!!!!!!");
                game.girls.loadAll(gameCanvas.roles);
                characterArray = [];
            }
            //game.loadStage(defaultStageData);
        });

        gameCanvas.stage = new PIXI.Container;
        gameCanvas.renderer = PIXI.autoDetectRenderer(1920, 1080, { transparent: true });
        gameCanvas.background = new PIXI.Sprite(PIXI.Texture.EMPTY);
        gameCanvas.stage.addChild(gameCanvas.background);
        gameCanvas.lastTime = new Date().getTime();
        gameCanvas.nowTmie = new Date().getTime();
        gameCanvas.fpsText = new PIXI.Text("0", { fill: "#ffffff" });
        gameCanvas.fpsText.x = 1;
        gameCanvas.fpsText.y = 0;
        gameCanvas.stage.addChild(gameCanvas.fpsText);
        gameCanvas.animationFrame = window.requestAnimationFrame(gameCanvas.animate);
        gameCanvas.canvas.html(gameCanvas.renderer.view);
    },

    loadToStage : function(defaultStageData, spineData){
        console.log("add to stage by calling addRole");

        for (i in defaultStageData) {
            var role = defaultStageData[i];
            var spine = spineData[role.name][role.skin];
                spine.code = role.name;
                spine.skin = role.skin;
                spine.x = role.x * 110;
                spine.y = 200 + role.y * 80;
                spine.scale = 1200;
            gameCanvas.addRole(spine);
        }
    },

    loadCharacter: function (currRoleData) {
        game.girls.loadAsync(currRoleData.name, currRoleData.name, gameCanvas);
    },

    addRole: function (skeletonData) {
        var len = gameCanvas.characters.length;
        var role = gameCanvas.characters[len] = new PIXI.spine.Spine(skeletonData);
        //var name = skeletonData.name + " " + gameCanvas.characters.length;
        gameCanvas.focusRole = role;
        role.x = skeletonData.x;
        role.y = skeletonData.y;
        role.scale.x = 1;
        role.scale.y = 1;
        //role.state.setAnimationByName(0, role.spineData.animations[0].name);
        role.animation = role.spineData.animations[0].name;
        role.skeleton.setToSetupPose();
        role.update(0);
        console.log("add " + skeletonData.name + " to stage");
        gameCanvas.stage.addChild(role);
    },

    animate: function () {
        gameCanvas.lastTime = gameCanvas.nowTime;
        gameCanvas.nowTime = new Date().getTime();
        gameCanvas.animationFrame = window.requestAnimationFrame(gameCanvas.animate);
        if (gameCanvas.isShowFPS)
            gameCanvas.fpsText.text = Math.floor(1000 / (gameCanvas.nowTime - gameCanvas.lastTime));
        else
            gameCanvas.fpsText.text = "";
        gameCanvas.renderer.render(gameCanvas.stage);
    },

    changeCharacter: function (skeletonData) {
        gameCanvas.name = skeletonData.name;
        gameCanvas.skeletonData = skeletonData;
        gameCanvas.spine = new PIXI.spine.Spine(skeletonData);
        gameCanvas.text+= " change " + gameCanvas.skeletonData.name + ";";
        //document.getElementById("debug").value = gameCanvas.text;

        gameCanvas.spine.x = 550;
        gameCanvas.spine.y = 500;
        gameCanvas.spine.scale.x = 2000;
        gameCanvas.spine.scale.y = 2000;
        var animation = gameCanvas.spine.spineData.animations;
        gameCanvas.spine.skeleton.setToSetupPose();
        gameCanvas.spine.update(0);
        gameCanvas.spine.autoUpdate = true;
    },

    changeBackground: function (n) {
        if (n == 0 && gameCanvas.background) {
            gameCanvas.background.texture = PIXI.Texture.EMPTY;
            gameCanvas.background.filename = '空';
            return;
        }
        if (gameCanvas.bgImage[n - 1]) {
            gameCanvas.background.texture = gameCanvas.bgImage[n - 1];
            gameCanvas.background.filename = game.background[n - 1];
            gameCanvas.background.scale.x = gameCanvas.renderer.width / gameCanvas.bgImage[n - 1].width;
            gameCanvas.background.scale.y = gameCanvas.renderer.height / gameCanvas.bgImage[n - 1].height;
        } else {
            var name = "bg" + game.background[n - 1];
            var path = "background/" + game.background[n - 1] + ".jpg"
            PIXI.loader.add(name, path).load(function (loader, resources) {
                gameCanvas.bgImage[n - 1] = resources[name].texture;
                gameCanvas.background.filename = game.background[n - 1];
                gameCanvas.background.texture = gameCanvas.bgImage[n - 1];
                gameCanvas.background.scale.x = gameCanvas.renderer.width / gameCanvas.bgImage[n - 1].width;
                gameCanvas.background.scale.y = gameCanvas.renderer.height / gameCanvas.bgImage[n - 1].height;
            });
        }
    },

};

function loadStorageItem(itemName, defaultValue) {
    var storage_val = localStorage.getItem(itemName);
    if (storage_val == null)
        return defaultValue;
    else
        return storage_val;
}