// Project module

var Project = (function (window, document, $, undefined) {

    var module = {};

    $(document).on( 'ready', check_browser );

    var project_status = ["Created", "In Progress", "Completed"];
    var notset = ["null", null, undefined];
    var help_message = "";

    // Make sure user is using chrome
    function check_browser() {
        document.body.className = 'vbox viewport';

	    var is_chrome = /chrome/.test( navigator.userAgent.toLowerCase() );
	    if((is_chrome == false) || (is_chrome == null)) {
		    alertify.alert('Sorry you must use Chrome!', function(){});
		    window.location.assign(CHROME_URL);
	    }

        if(localStorage.getItem("role") === null) {
            alertify.alert("No role selected from Home page! Redirecting you back to Home page...", function(){});
		    window.location.assign(HOME_URL);
        }

        if(localStorage.getItem("token") === null) {
            alertify.alert("No token found! Redirecting you back to the Home page...", function(){});
		    window.location.assign(HOME_URL);
        }

        // Load data from server - stagger the calls with delays
        get_users();
        setTimeout(function() { get_categories(); }, 100);
        setTimeout(function() { get_languages(); }, 200);
        setTimeout(function() { get_projects(); }, 300);
        setTimeout(function() { get_createdprojects(); }, 400);

        // User logged on using a temporary password
        if(localStorage.templogin === true) {
            alertify.alert("You need to change your password now!\nIf you do not, you will not be able to login once you leave this session.", function(){changepassword();});
        }
    }

    // Return the value if not null or return a string
    function normnull(value, string) {
        if(notset.indexOf(value) === -1) {
            return value;
        } else {
            return string;
        }
    }

    // Redirect the user to the homepage
    module.home = function() {
        alertify.confirm('You will be redirected to the Home page. Leave anyway?',
            function() {
                var items = ["username", "token", "home", "role"];
                for(var ndx = 0; ndx < items.length; items++) {
        	        localStorage.setItem(items[ndx], '');
        	        localStorage.removeItem(items[ndx]);
                }
	            window.location.assign(HOME_URL);
        }, function(){alertify.error("Redirect to the Home page canceled")});
    }

    // Tab selection code for different projects
    module.openProject = function(evt, projectName) {
        // Declare all variables
        var i, tabcontent, tablinks;

        // Get all elements with class="tabcontent" and hide them
        tabcontent = document.getElementsByClassName("tabcontent");
        for (i = 0; i < tabcontent.length; i++) {
            tabcontent[i].style.display = "none";
        }

        // Get all elements with class="tablinks" and remove the class "active"
        tablinks = document.getElementsByClassName("tablinks");
        for (i = 0; i < tablinks.length; i++) {
            tablinks[i].className = tablinks[i].className.replace(" active", "");
        }

        // Show the current tab, and add an "active" class to the button that opened the tab
        document.getElementById(projectName).style.display = "block";
        evt.currentTarget.className += " active";

        if(projectName == "projectspace") {
            help_message = "<h1>Project Manager Page</h1><hr>";
            help_message += "<p>Manage projects</p>";
            help_message += "<h2>Project list table</h2>";
            help_message += "<p>This table shows a list <strong>owned projects</strong> and <strong>created projects</strong>. ";
            help_message += "You can change between these project types by clicking on the corresponding tabs.  ";
            help_message += "To access the project's information, click on a table row. ";
            help_message += "Clicking on the table headings will sort the list by that heading.</p>";
            help_message += "<h2>Project Workflow</h2>";
            help_message += "<p>A typical project creation process is as follows:<br>";
            help_message += "Create a new project.<br>";
            help_message += "Upload an OGG Vorbis audio file (1 channel, 16kHz).<br>";
            help_message += "Create tasks -- split the audio into regions that are allocated to editors.<br>";
            help_message += "Assign tasks -- once the tasks have been created, assign them to the editors<br></p>";

            help_message += "<h2>Buttons</h2>";
            help_message += "<p><b>Refresh</b> -- refresh the project list.</p>";
            help_message += "<h2>Navigation</h2>";
            help_message += "<p><b>Home</b> -- return you to the Home page.<br>";
            help_message += "<b>Refresh Projects</b> -- refresh the project list.<br>";
            help_message += "<b>Create Project</b> -- create a new project.<br>";
            help_message += "<b>Update Password</b> -- update your password.<br>";
            help_message += "<b>Logout</b> -- logout and return to the Home page.<br>";
            help_message += "<b>Help</b> -- provides this message.</p>";

        } else {
            help_message = "<h1>Project Manager Page</h1><hr>";
            help_message += "<p>A display of created projects. You do not have access to these projects.</p>";
        }
    }

    // Get a list of categories from the app server
    function get_categories() {
        document.body.className = 'vbox viewport waiting';
	    var data = {};
	    data["token"] = localStorage.token;
	    appserver_send(APP_PLISTCATEGORIES, data, categories_callback);
    }

    // Save the categories
    var categories;
    function categories_callback(xmlhttp) {
	    if ((xmlhttp.status==503)) {
		    alertify.alert("Application server unavailable", function(){});
	    }

	    if ((xmlhttp.readyState==4) && (xmlhttp.status != 0)) {
		    var response_data = JSON.parse(xmlhttp.responseText);
		    if(xmlhttp.status==200) {
                categories = response_data["categories"];
                document.body.className = 'vbox viewport';
		    } else { 
			    alertify.alert("CATEGORIES ERROR: " + response_data["message"], function(){});
                document.body.className = 'vbox viewport';
		    }
	    }

        if ((xmlhttp.readyState==4) && (xmlhttp.status == 0)) {
            alertify.alert("CATEGORIES Network Error. Please check your connection and try again later!", function(){});
            document.body.className = 'vbox viewport';
        }
    }

    // Get a list of languages from the app server
    function get_languages() {
        document.body.className = 'vbox viewport waiting';
	    var data = {};
	    data["token"] = localStorage.token;
	    appserver_send(APP_PLISTLANGUAGES, data, languages_callback);
    }

    // Get languages callback
    var languages;
    function languages_callback(xmlhttp) {
	    if ((xmlhttp.status==503)) {
		    alertify.alert("Application server unavailable", function(){});
	    }

	    if ((xmlhttp.readyState==4) && (xmlhttp.status != 0)) {
		    var response_data = JSON.parse(xmlhttp.responseText);
		    if(xmlhttp.status==200) {
                languages = response_data["languages"];
                document.body.className = 'vbox viewport';
		    } else { 
			    alertify.alert("LANGUAGES ERROR: " + response_data["message"], function(){});
                document.body.className = 'vbox viewport';
		    }
	    }

        if ((xmlhttp.readyState==4) && (xmlhttp.status == 0)) {
            alertify.alert("LANGUAGES Network Error. Please check your connection and try again later!", function(){});
            document.body.className = 'vbox viewport';
        }
    }

    // Get a list of users from the app server
    function get_users() {
        document.body.className = 'vbox viewport waiting';
	    var data = {};
	    data["token"] = localStorage.token;
	    appserver_send(APP_PLOADUSERS, data, users_callback);
    }

    // Get users callback
    var users;
    var editors = {};
    var projectmanagers = {};
    function users_callback(xmlhttp) {
	    if ((xmlhttp.status==503)) {
		    alertify.alert("Application server unavailable", function(){});
	    }

	    if ((xmlhttp.readyState==4) && (xmlhttp.status != 0)) {
		    var response_data = JSON.parse(xmlhttp.responseText);
		    if(xmlhttp.status==200) {
                alertify.success("Users loaded");
                users = response_data;
                filter_users();
		    } else { 
			    alertify.alert("LOADUSERS ERROR: " + response_data["message"], function(){});
                document.body.className = 'vbox viewport';
		    }
	    }

        if ((xmlhttp.readyState==4) && (xmlhttp.status == 0)) {
            alertify.alert("LOADUSERS Network Error. Please check your connection and try again later!", function(){});
            document.body.className = 'vbox viewport';
        }
    }

    // Separate users by roles
    function filter_users() {
        for(var key in users) {
            var role = users[key]["role"];
            if(role.indexOf(PROJECT_ROLE) != -1) {
                projectmanagers[key] = users[key];
            }
            if(role.indexOf(EDITOR_ROLE) != -1) {
                editors[key] = users[key];
            }
        }
        document.body.className = 'vbox viewport';
    }

    // Get projects owned by this user
    function get_projects() {
        document.body.className = 'vbox viewport waiting';
	    var data = {};
	    data["token"] = localStorage.token;
	    appserver_send(APP_PLISTPROJECTS, data, projects_callback);
    }

    // Get all projects
    function get_all_projects() {
        get_projects();
        get_createdprojects();
    }
    module.get_all_projects = function() { get_all_projects(); };

    // Project application server response
    var projects;
    function projects_callback(xmlhttp) {
	    if ((xmlhttp.status==503)) {
		    alertify.alert("Application server unavailable", function(){});
	    }

	    if ((xmlhttp.readyState==4) && (xmlhttp.status != 0)) {
		    var response_data = JSON.parse(xmlhttp.responseText);
		    if(xmlhttp.status==200) {
                alertify.success("Retrieved Projects");
                projects = response_data;
                display_projects(response_data);
                document.getElementById("defproject").click();
		    } else { 
			    alertify.alert("LISTPROJECTS ERROR: " + response_data["message"], function(){});
                document.body.className = 'vbox viewport';
		    }
	    }

        if ((xmlhttp.readyState==4) && (xmlhttp.status == 0)) {
            alertify.alert("LISTPROJECTS Network Error. Please check your connection and try again later!", function(){});
            document.body.className = 'vbox viewport';
        }
    }

    // Get all projects created by this user
    function get_createdprojects() {
        document.body.className = 'vbox viewport waiting';
	    var data = {};
	    data["token"] = localStorage.token;
	    appserver_send(APP_PLISTCREATEDPROJECTS, data, createdprojects_callback);
    }

    // Project application server response
    var created_projects;
    function createdprojects_callback(xmlhttp) {
	    if ((xmlhttp.status==503)) {
		    alertify.alert("Application server unavailable", function(){});
	    }

	    if ((xmlhttp.readyState==4) && (xmlhttp.status != 0)) {
		    var response_data = JSON.parse(xmlhttp.responseText);
		    if(xmlhttp.status==200) {
                alertify.success("Retrieved create projects");
                created_projects = response_data;
                display_createdprojects(response_data);
		    } else { 
			    alertify.alert("LISTCREATEDPROJECTS ERROR: " + response_data["message"], function(){});
                document.body.className = 'vbox viewport';
		    }
	    }

        if ((xmlhttp.readyState==4) && (xmlhttp.status == 0)) {
            alertify.alert("LISTCREATEDPROJECTS Network Error. Please check your connection and try again later!", function(){});
            document.body.className = 'vbox viewport';
        }
    }

    // Selected a column to sort by
    var psort = 0;
    module.sortselect = function(tag) {
        psort = tag;
        display_projects(projects);
    }

    // Display owned projects
    var pdisplay;
    function display_projects(data) {
        var ps = document.getElementById("projectspace");
        var data = data["projects"];

        if(data.length > 0) {
            pdisplay = [];
            for (var i = 0, len = data.length; i < len; i++) {
                var obj = data[i];
                pdisplay.push([i, obj["projectname"], obj["projectmanager"], obj["collator"], obj["category"], parseFloat(obj["creation"]), obj["errstatus"]]);
            }

            // Sort projects by time
            pdisplay.sort(function(a, b){
                return a[psort+1] > b[psort+1] ? 1 : -1;
            });

            var context;
            context = "<table class='project'>";
            context += "<tr><th onclick='Project.sortselect(0)'>Project Name</th> <th onclick='Project.sortselect(1)'>Project Manager</th> <th onclick='Project.sortselect(2)'>Collator</th>";
            context += "<th onclick='Project.sortselect(3)'>Category</th> <th onclick='Project.sortselect(4)'>Date</th> <th onclick='Project.sortselect(5)'>Error Status</th> </tr>";

            for (var i = 0, len = pdisplay.length; i < len; i++) {
                var obj = data[pdisplay[i][0]];
                context += "<tr onclick='Project.project_selected("+ pdisplay[i][0] +")'";
                if(notset.indexOf(obj["jobid"]) === -1) {
                    context += ' style="outline: none; border-color: #ff0000; box-shadow: 0 0 10px #FF0000;">';
                } else {
                    context += ">";
                }
                context += "<td>" + obj["projectname"] + "</td>";

                var projman = "Not Selected";
                if(users.hasOwnProperty(obj["projectmanager"])) {
                    projman = users[obj["projectmanager"]]["name"] + " " + users[obj["projectmanager"]]["surname"];
                }
                context += "<td>" + projman + "</td>";
                var collator = "Not Selected";
                if(users.hasOwnProperty(obj["collator"])) {
                    collator = users[obj["collator"]]["name"] + " " + users[obj["collator"]]["surname"];
                }
                context += "<td>" + collator + "</td>";
                context += "<td>" + obj["category"] + "</td>";
                var d = new Date();
                d.setTime(parseFloat(obj["creation"])*1000.0);
                context += "<td>" + d.toDateString() + "</td>";
                //context += "<td>" + normnull(obj["projectstatus"], "Not completed") + "</td>";
                context += "<td> " + normnull(obj["errstatus"], "No error") + " </td></tr>";
            }
            context += "</table>";
        } else {
            context = "<p>No projects</p>";
        }
        ps.innerHTML = context;
        document.body.className = 'vbox viewport';
    }

    // Selected a column to sort by
    var cpsort = 0;
    module.csortselect = function(tag) {
        cpsort = tag;
        display_createdprojects(created_projects);
    }

    // Display created projects
    function display_createdprojects(data) {
        var cps = document.getElementById("created");
        var data = data["projects"];

        if(data.length > 0) {
            var cpdisplay = [];
            for (var i = 0, len = data.length; i < len; i++) {
                var obj = data[i];
                cpdisplay.push([i, obj["projectname"], obj["projectmanager"], obj["collator"], obj["category"], parseFloat(obj["creation"]), obj["errstatus"]]);
            }

            // Sort projects by time
            cpdisplay.sort(function(a, b){
                return a[cpsort+1] > b[cpsort+1] ? 1 : -1;
            });

            var context;
            context = "<table class='project'>";
            context += "<tr> <th onclick='Project.csortselect(0)'>Project Name</th> <th onclick='Project.csortselect(1)'>Project Manager</th> <th onclick='Project.csortselect(2)'>Collator</th>";
            context += "<th onclick='Project.csortselect(3)'>Category</th> <th onclick='Project.csortselect(4)'>Date</th> <th onclick='Project.csortselect(5)'>Error Status</th> </tr>";
            for (var i = 0, len = cpdisplay.length; i < len; i++) {
                var obj = data[cpdisplay[i][0]];
                context += "<tr><td>" + obj["projectname"] + "</td>";
                var projman = "Not Selected";
                if(users.hasOwnProperty(obj["projectmanager"])) {
                    projman = users[obj["projectmanager"]]["name"] + " " + users[obj["projectmanager"]]["surname"];
                }
                context += "<td>" + projman + "</td>";
                var collator = "Not Selected";
                if(users.hasOwnProperty(obj["collator"])) {
                    collator = users[obj["collator"]]["name"] + " " + users[obj["collator"]]["surname"];
                }
                context += "<td>" + collator + "</td>";
                context += "<td>" + obj["category"] + "</td>";
                var d = new Date();
                d.setTime(parseFloat(obj["creation"])*1000.0);
                context += "<td>" + d.toDateString() + "</td>";
                //context += "<td>" + normnull(obj["projectstatus"], "Not completed") + "</td>";
                context += "<td> " + normnull(obj["errstatus"], "No error") + " </td></tr>";
            }
            context += "</table>";
            cps.innerHTML = context;
        } else {
            cps.innerHTML = "<p>No projects</p>";
        }
        document.body.className = 'vbox viewport';
    }

    // User selected project and set selected variable
    var selected;
    module.project_selected = function(i) {
        var ps = document.getElementById("projectspace");
        ps.innerHTML = "";
        var obj = projects["projects"][i];
        selected = i;

        help_message = "<h1>Project Manager Page</h1><hr>";
        help_message += "<p>A displayed of the selected project's information.</p>";
        help_message += "<h2>Project information</h2>";
        help_message += "<p>This project view shows all the project information. ";
        help_message += "You can click on the project-related buttons, located after the project information, to perform certain actions on the projects. ";
        help_message += "Once you have upload audio, the next step is to create tasks. After creating tasks you can assign them to the editors. ";
        help_message += "Once assigned, you cannot access the project tasks. In this project state you can only update project information. </p>";

        help_message += "<h2>Buttons</h2>";
        help_message += "<p><b>Refresh</b> -- refresh the project list.<br>";
        help_message += "<b>Create/Edit Tasks</b> -- create tasks or edit existing tasks for editors by splitting up the audio.<br>";
        help_message += "<b>Assign Tasks</b> -- assign create editor tasks to the editors. <strong>Once you have pressed the assign button you CANNOT edit created tasks.</strong><br>";
        help_message += "<b>Update Project info</b> -- update the information of a project that has been assigned. You can only change <strong>Project Manager, Project Category and Collators</strong>.<br>";
        help_message += "<b>Delete Project</b> -- delete the project and remove all editor tasks.<br>";
        help_message += "<b>Clear Project Error</b> -- clear a project error so you can access the project. This may occur when a requested speech service terminated incorrectly.<br>";
        help_message += "<b>Unlock Project</b> -- unlock a project that has been locked by a requested speech service. The project will be highlighted red when locked.<br>";
        help_message += "<b>Go Back</b> -- return to the project list view.</p>";

        help_message += "<h2>Navigation</h2>";
        help_message += "<p><b>Home</b> -- return you to the Home page.<br>";
        help_message += "<b>Refresh Projects</b> -- refresh the project list.<br>";
        help_message += "<b>Create Project</b> -- create a new project.<br>";
        help_message += "<b>Update Password</b> -- update your password.<br>";
        help_message += "<b>Logout</b> -- logout and return to the Home page.<br>";
        help_message += "<b>Help</b> -- provides this message.</p>";

        var context;
        context = "<fieldset><legend>Project</legend><table class='project'>";
        context += "<tr><td><label>Project Name: </label></td><td>" + obj["projectname"] + "</td></tr>";

        context += "<tr><td><label>Project Manager: </label></td><td> <select id='pjmsel' onchange='Project.assign_pjm(this.id,this.value)'>";
        context += '<option value="null">Project Managers...</option>';
        for(var key in projectmanagers) {
            var tmp = projectmanagers[key]["name"] + " " + projectmanagers[key]["surname"];
            context += '<option value="' + key + '">' + tmp + '</option>';
        }
        context += '</select></td></tr>';

        context += '<tr><td><label>Project Category: </label></td><td><select id="csel" onchange="Project.assign_category(this.id,this.value)">';
        context += '<option value="null">Categories...</option>';
        for(var i = 0 ; i < categories.length; i++) {
            var key = categories[i];
            context += '<option value="' + key + '">' + key + '</option>';
        }
        context += '</select></td></tr>';

        context += "<tr><td><label>Collators: </label></td><td> <select id='colsel' onchange='Project.assign_collator(this.id,this.value)'>";
        context += '<option value="null">Collators...</option>';
        for(var key in editors) {
            var tmp = editors[key]["name"] + " " + editors[key]["surname"];
            context += '<option value="' + key + '">' + tmp + '</option>';
        }
        context += '</select></td></tr>';

        var d = new Date();
        d.setTime(parseFloat(obj["creation"])*1000.0);
        context += "<tr><td><label>Creation Date: </label></td><td>" + d + "</td></tr>";

        /*context += "<tr><td><label>Project Status: </label></td><td> <select id='statussel' onchange='Project.assign_status(this.id,this.value)'>";
        context += '<option value="null">Project Status...</option>';
        for(var i = 0; i < project_status.length; i++) {
            context += '<option value="' + project_status[i] + '">' + project_status[i] + '</option>';
        }
        context += '</select></td></tr>';*/

        //context += "<tr><td><label>Project Status: </label></td><td>" + obj["projectstatus"] + "</td></tr>";
        context += "<tr><td><label>Assigned: </label></td><td>" + obj["assigned"] + "</td></tr>";
        context += "<tr><td><label>Project Error Status: </label></td><td>" + normnull(obj["errstatus"], "No Error") + "</td></tr>";

        if(notset.indexOf(obj["jobid"]) === -1) {
            context += '<tr style="outline: none; border-color: #ff0000; box-shadow: 0 0 10px #ff0000;"><td><label>Project Lock Status: </label></td><td> Locked </td></tr>';
        } else {
            context += "<tr><td><label>Project Lock Status: </label></td><td> Not Locked </td></tr>";
        }
        context += "<tr><td><label>Audio: </label></td>";
        if(obj["audiofile"] == undefined) {
            context += '<td><input type="file" onchange="Project.upload_audio()"></td></tr>';
        } else {
            context += "<td>Audio uploaded</td></tr>";
            var date = new Date(null);
            date.setSeconds(parseFloat(obj["audiodur"])); // specify value for SECONDS here
            var result = date.toISOString().substr(11, 12);
            context += "<tr><td><label>Audio Duration: </label></td><td> " + result + "</td></tr>";
        }

        context += '</table></fieldset><br><hr><br><button onclick="Project.task_project()">Create/Edit Tasks</button> &nbsp;&nbsp;';
        context += '<button onclick="Project.assign_tasks()">Assign Tasks</button> <button onclick="Project.update_project()">Update Project</button> <button onclick="Project.delete_project()">Delete Project</button> &nbsp;&nbsp;';
        context += '<button onclick="Project.clearerror_project()">Clear Project Error</button> <button onclick="Project.unlock_project()">Unlock Project</button> ';
        context += '&nbsp;&nbsp;<button onclick="Project.goback()">Go Back</button>';
        ps.innerHTML = context;
        document.body.className = 'vbox viewport';

        if(obj["projectmanager"] !== null) {
            var gh = document.getElementById('pjmsel');
            gh.value = obj["projectmanager"];
        }
        if(obj["category"] !== null) {
            var gh = document.getElementById('csel');
            gh.value = obj["category"];
        }
        if(obj["collator"] !== null) {
            var gh = document.getElementById('colsel');
            gh.value = obj["collator"];
        }
        if(obj["status"] !== null) {
            var gh = document.getElementById('statussel');
            gh.value = obj["projectstatus"];
        }
    }

    var changes = false;
    // User has assigned a project manager
    module.assign_pjm = function(id, value) {
        var obj = projects["projects"][selected];
        obj["projectmanager"] = value;
        changes = true;
    }

    // User has assigned a category
    module.assign_category = function(id, value) {
        var obj = projects["projects"][selected];
        obj["category"] = value;
        changes = true;
    }

    // User has assigned a collator
    module.assign_collator = function(id, value) {
        var obj = projects["projects"][selected];
        obj["collator"] = value;
        changes = true;
    }

    // User has changed the projectstatus
    module.assign_status = function(id, value) {
        var obj = projects["projects"][selected];
        obj["projectstatus"] = value;
        changes = true;
    }

    // Go back to listing projects
    module.goback = function() {
        if(changes) {
            alertify.confirm('There are unsaved changes to this project. Leave anyway?',
                function() {
                changes = false;
                selected = -1;
                display_projects(projects);
            }, function(){});
        } else {
            selected = -1;
            display_projects(projects);
        }
    }

    // Save current project information and goto tasks splitter
    module.task_project = function() {
        if(selected == -1) {
            alertify.alert("Please select a project before trying to create tasks!", function(){});
            return false;
        }

        var obj = projects["projects"][selected];
        if(obj["assigned"] == "Y") {
            alertify.alert("This project has been assigned so you will not be able to create tasks!", function(){});
            return false;
        }

        if(notset.indexOf(obj["audiofile"]) !== -1) {
            alertify.alert("Please upload an OGG Vorbis, single channel audio file!", function(){});
            return false;
        }

        if(obj["jobid"] !== null) {
            alertify.alert("This project has been locked by a speech service request and is waiting for process to finish!", function(){});
            return false;
        }

        localStorage.setItem("project", JSON.stringify(obj));
        localStorage.setItem("editors", JSON.stringify(editors));
        localStorage.setItem("languages", JSON.stringify(languages));
	    window.location.assign(TASK_URL);
    }

    // Update project - can only happen after assignment
    module.update_project = function() {
        if(selected == -1) {
            alertify.alert("Please select a project that you would like to update!", function(){});
            return false;
        }

        var obj = projects["projects"][selected];
        /*if(obj["assigned"] == "N") {
            alertify.alert("Project must been assigned first before updating!", function(){});
            return false;
        }*/

        if(obj["jobid"] !== null) {
            alertify.alert("This project has been locked by a speech service request and is waiting for process to finish!", function(){});
            return false;
        }

        document.body.className = 'vbox viewport waiting';
	    var data = {};
        var tasks = {};
        var project = {};

         // Setup project information
        project["projectname"] = obj["projectname"];
        project["category"] = obj["category"];
        project["projectmanager"] = obj["projectmanager"];
        project["collator"] = obj["collator"];
        project["projectstatus"] = obj["projectstatus"];
        project["errstatus"] = obj["errstatus"];

        // Setup request body
	    data["token"] = localStorage.token;
        data["projectid"] = obj["projectid"];
        data["project"] = project;
	    appserver_send(APP_PUPDATEPROJECT, data, update_project_callback);
    }

    // Update project callback
    function update_project_callback(xmlhttp) {
	    if ((xmlhttp.status==503)) {
		    alertify.alert("Application server unavailable", function(){});
	    }

	    if ((xmlhttp.readyState==4) && (xmlhttp.status != 0)) {
		    var response_data = JSON.parse(xmlhttp.responseText);
		    if(xmlhttp.status==200) {
                alertify.success("Project updated");
                get_projects();
                document.body.className = 'vbox viewport';
		    } else { // Something unexpected happened
			    alertify.alert("UPDATEPROJECT ERROR: " + response_data["message"], function(){});
                document.body.className = 'vbox viewport';
		    }
	    }

        if ((xmlhttp.readyState==4) && (xmlhttp.status == 0)) {
            alertify.alert("UPDATEPROJECT Network Error. Please check your connection and try again later!", function(){});
            document.body.className = 'vbox viewport';
        }
    }

    // Assign tasks
    module.assign_tasks = function() {
        if(selected == -1) {
            alertify.alert("No project selected!", function(){});
            return false;
        }

        var obj = projects["projects"][selected];
        if(notset.indexOf(obj["jobid"]) == -1) {
            alertify.alert("This project has been locked by a speech service request and is waiting for process to finish!", function(){});
            return false;
        }

        if(notset.indexOf(obj["audiofile"]) !== -1) {
            alertify.alert("Please upload an audio file and create tasks before assigning tasks!", function(){});
            return false;
        }

        if(obj["assigned"] == "Y") {
            alertify.alert("This project has been assigned already!", function(){});
            return false;
        }

        if(notset.indexOf(obj["collator"]) !== -1) {
            alertify.alert("Please select a collator before assigning the tasks!", function(){});
            return false;
        }

        document.body.className = 'vbox viewport waiting';
	    var data = {};
	    data["token"] = localStorage.token;
        data["projectid"] = obj["projectid"];
        data["collator"] = obj["collator"];
	    appserver_send(APP_PASSIGNTASKS, data, assign_tasks_callback);
    }

    // Assign task callback
    function assign_tasks_callback(xmlhttp) {
	    if ((xmlhttp.status==503)) {
		    alertify.alert("Application server unavailable", function(){});
	    }

	    if ((xmlhttp.readyState==4) && (xmlhttp.status != 0)) {
		    var response_data = JSON.parse(xmlhttp.responseText);
		    if(xmlhttp.status==200) {
			    alertify.success("Tasks assigned to Editors");
                get_projects();
                document.body.className = 'vbox viewport';
		    } else { // Something unexpected happened
			    alertify.alert("ASSIGNTASKS ERROR: " + response_data["message"], function(){});
                document.body.className = 'vbox viewport';
		    }
	    }

        if ((xmlhttp.readyState==4) && (xmlhttp.status == 0)) {
            alertify.alert("ASSIGNTASKS Network Error. Please check your connection and try again later!", function(){});
            document.body.className = 'vbox viewport';
        }
    }

    // User wants to upload audio
    var audio_dur;
    module.upload_audio = function() {
        document.body.className = 'vbox viewport waiting';
        var file = document.querySelector('input[type=file]').files[0];
        var reader = new FileReader();

        reader.addEventListener("load", function () {
            // Check if audio is OGG Vorbis
            if(file.type != "audio/ogg") {
                alertify.alert("Only Vorbis OGG audio file format supported. Please convert your audio file before uploading!", function(){return false;});
            }
            // Stop user from uploading file larger than 50 Mb
            /*if(file.size > (50*1024*1024)) {
                alert("Audio file to large!");
                return false;
            }*/

            save_audio(file, reader.result);
        }, false);

        if (file) {
            reader.readAsBinaryString(file);
        }
    }

    // Push audio to application server
    function save_audio(file, binary) {
        if(selected == -1) {
            alertify.alert("Please select a project first before uploading an audio file!", function(){});
            return false;
        }

        var obj = projects["projects"][selected];
        var boundary = "e672106676d345be8a7f2d4afe93feab";
        var data = "--" + boundary;

        data += "\r\n";
        data += 'Content-Disposition: form-data; name="token"; filename="token"\r\n';
        data += "\r\n";
        data += localStorage.token;
        data += "\r\n";
        data += "--" + boundary;
        data += "\r\n";

        data += 'Content-Disposition: form-data; name="projectid"; filename="projectid"\r\n';
        data += "\r\n";
        data += obj["projectid"];
        data += "\r\n";
        data += "--" + boundary;
        data += "\r\n";

        data += 'Content-Disposition: form-data; name="filename"; filename="filename"\r\n';
        data += "\r\n";
        data += file.name;
        data += "\r\n";
        data += "--" + boundary;
        data += "\r\n";

        data += 'Content-Disposition: form-data; name="file"; filename="' + file.name + '"\r\n';
        data += "\r\n";
        data += binary;
        data += "\r\n";
        data += "--" + boundary + "--";
        data += "\r\n";

        try {
            if (typeof XMLHttpRequest.prototype.sendAsBinary == 'undefined') {
                XMLHttpRequest.prototype.sendAsBinary = function(text){
                var data = new ArrayBuffer(text.length);
                var ui8a = new Uint8Array(data, 0);
                for (var i = 0; i < text.length; i++) ui8a[i] = (text.charCodeAt(i) & 0xff);
                    this.send(ui8a);
                }
            }
        } catch (e) {}

	    var xmlhttp = new XMLHttpRequest();
	    xmlhttp.onreadystatechange = function() {save_audio_callback(xmlhttp)};
	    xmlhttp.open("POST", APP_PUPLOADAUDIO, true);
        xmlhttp.setRequestHeader('Content-Type','multipart/form-data; boundary=' + boundary);
	    xmlhttp.sendAsBinary(data);
    }

    // Check audio upload application server response
    function save_audio_callback(xmlhttp) {
	    if ((xmlhttp.status==503)) {
		    alertify.alert("Application server unavailable", function(){});
	    }

	    if ((xmlhttp.readyState==4) && (xmlhttp.status != 0)) {
		    var response_data = JSON.parse(xmlhttp.responseText);
		    if(xmlhttp.status==200) {
                alertify.success("Audio Uploaded");
                get_projects();
                document.body.className = 'vbox viewport';
		    } else { // Something unexpected happened
			    alertify.alert("UPLOADAUDIO ERROR: " + response_data["message"], function(){});
                document.body.className = 'vbox viewport';
		    }
	    }

        if ((xmlhttp.readyState==4) && (xmlhttp.status == 0)) {
            alertify.alert("UPLOADAUDIO Network Error. Please check your connection and try again later!", function(){});
            document.body.className = 'vbox viewport';
        }
    }

    // Get details for a new project
    module.new_project = function() {
        var ps = document.getElementById("projectspace");
        ps.innerHTML = "";

        document.getElementById("defproject").click();

        help_message = "<h1>Project Manager Page</h1><hr>";
        help_message += "<p>Create a new project.</p>";
        help_message += "<h2>New Project</h2>";
        help_message += "<p>Provide a <strong>Project Name</strong>, select a <strong>Project Manager</strong> and select a <strong>Project Category</strong>.</p> ";
        help_message += "<h2>Buttons</h2>";
        help_message += "<p><b>Refresh</b> -- refresh the project list.<br>";
        help_message += "<b>Create Project</b> -- create a new project.<br>";
        help_message += "<b>Cancel</b> -- cancel project creation process.</p>";
        help_message += "<h2>Navigation</h2>";
        help_message += "<p><b>Home</b> -- return you to the Home page.<br>";
        help_message += "<b>Refresh Projects</b> -- refresh the project list.<br>";
        help_message += "<b>Create Project</b> -- create a new project.<br>";
        help_message += "<b>Update Password</b> -- update your password.<br>";
        help_message += "<b>Logout</b> -- logout and return to the Home page.<br>";
        help_message += "<b>Help</b> -- provides this message.</p>";

        var context;
        context = "<fieldset><legend>New Project</legend><table class='project'>";
        context += "<tr><td style='text-align: left;'><label>Project Name: </label></td>";
        context += '<td><input id="projectname" name="projectname" placeholder="" type="text" maxlength="32"/></td></tr>';
        context += '<tr><td style="text-align: left;"><label>Project Manager: </label></td><td><select id="projmansel">';
        context += '<option value="null">Project Managers...</option>';
        for(var key in projectmanagers) {
            var tmp = projectmanagers[key]["name"] + " " + projectmanagers[key]["surname"];
            context += '<option value="' + key + '">' + tmp + '</option>';
        }
        context += '</select></td></tr>';

        context += '<tr><td style="text-align: left;"><label>Project Categories: </label><td><select id="catsel">';
        context += '<option value="null">Categories...</option>';
        for(var i = 0 ; i < categories.length; i++) {
            var key = categories[i];
            context += '<option value="' + key + '">' + key + '</option>';
        }
        context += '</select></td></tr>';

        context += '<tr><td><button onclick="Project.create_project()">Create Project</button></td>';
        context += '<td style="text-align: right;"><button onclick="Project.project_cancel()">Cancel</button></td></tr></table></fieldset>';
        ps.innerHTML = context;
    }

    // Go ahead and create new project
    module.create_project = function() {
	    projectname = document.getElementById("projectname").value;

	    // Test if projectname set
	    if(projectname == "") {
            alertify.alert("Please enter a project name!", function(){});
            return false;
	    }

        // Check project manager has been selected
        var e = document.getElementById("projmansel");
        var pjm = e.options[e.selectedIndex].value;
        if(pjm === "null") {
            alertify.alert("Please select a project manager!", function(){});
            return false;
        }

        // Check project category has been selected
        var e = document.getElementById("catsel");
        var cat = e.options[e.selectedIndex].value;
        var cattext = e.options[e.selectedIndex].text;
        if(cat === "null") {
            alertify.alert("Please select a project category", function(){});
            return false;
        }

        document.body.className = 'vbox viewport waiting';
	    var data = {};
	    data["token"] = localStorage.token;
        data["projectname"] = projectname;
        data["projectmanager"] = pjm;
        data["category"] = cattext;
        data["projectstatus"] = "Created";
	    appserver_send(APP_PCREATEPROJECT, data, create_projects_callback);
    }

    // Check create project application server response
    function create_projects_callback(xmlhttp) {
	    if ((xmlhttp.status==503)) {
		    alertify.alert("Application server unavailable", function(){});
	    }

	    if ((xmlhttp.readyState==4) && (xmlhttp.status != 0)) {
		    var response_data = JSON.parse(xmlhttp.responseText);
		    if(xmlhttp.status==200) {
                alertify.success("Project Created");
                get_projects();
                document.body.className = 'vbox viewport';
		    } else { // Something unexpected happened
			    alertify.alert("CREATEPROJECT ERROR: " + response_data["message"], function(){});
                document.body.className = 'vbox viewport';
		    }
	    }

        if ((xmlhttp.readyState==4) && (xmlhttp.status == 0)) {
            alertify.alert("CREATEPROJECT Network Error. Please check your connection and try again later!", function(){});
            document.body.className = 'vbox viewport';
        }
    }

    // User cancelled new project - display current list
    module.project_cancel = function() {
        display_projects(projects);
    }

    // Delete the selected project
    module.delete_project = function() {
        if(selected == -1) {
            alertify.alert("Please select a project to delete!", function(){});
            return false;
        }

        alertify.confirm("Are you sure you want to delete this project?",
            function() {
                remove_project(selected);
            }, function(){"Project deletion canceled"});
    }

    // Delete project from application server
    function remove_project(ndx) {
        document.body.className = 'vbox viewport waiting';
        var obj = projects["projects"][ndx];
	    var data = {};
	    data["token"] = localStorage.token;
        data["projectid"] = obj["projectid"];
	    appserver_send(APP_PDELETEPROJECT, data, remove_project_callback);
    }

    // Check remove project application server response
    function remove_project_callback(xmlhttp) {
	    if ((xmlhttp.status==503)) {
		    alertify.alert("Application server unavailable", function(){});
	    }

	    if ((xmlhttp.readyState==4) && (xmlhttp.status != 0)) {
		    var response_data = JSON.parse(xmlhttp.responseText);
		    if(xmlhttp.status==200) {
                alertify.success("Project Deleted");
                get_projects();
                document.body.className = 'vbox viewport';
		    } else { // Something unexpected happened
			    alertify.alert("DELETEPROJECT ERROR: " + response_data["message"], function(){});
                document.body.className = 'vbox viewport';
		    }
	    }

        if ((xmlhttp.readyState==4) && (xmlhttp.status == 0)) {
            alertify.alert("DELETEPROJECT Network Error. Please check your connection and try again later!", function(){});
            document.body.className = 'vbox viewport';
        }
    }

    //Remove project error message
    module.clearerror_project = function() {
        if(selected == -1) {
            alertify.alert("Please select a project before trying to clear an error!", function(){});
            return false;
        }

        document.body.className = 'vbox viewport waiting';
        var obj = projects["projects"][selected];
	    var data = {};
	    data["token"] = localStorage.token;
        data["projectid"] = obj["projectid"];
	    appserver_send(APP_PCLEARERROR, data, clearerror_project_callback);
    }

    //clear project error callback
    function clearerror_project_callback(xmlhttp) {
	    if ((xmlhttp.status==503)) {
		    alertify.alert("Application server unavailable", function(){});
	    }

	    if ((xmlhttp.readyState==4) && (xmlhttp.status != 0)) {
		    var response_data = JSON.parse(xmlhttp.responseText);
		    if(xmlhttp.status==200) {
                alertify.success("Error cleared");
                get_projects();
                document.body.className = 'vbox viewport';
		    } else { // Something unexpected happened
			    alertify.alert("CLEARERROR ERROR: " + response_data["message"], function(){});
                document.body.className = 'vbox viewport';
		    }
	    }

        if ((xmlhttp.readyState==4) && (xmlhttp.status == 0)) {
            alertify.alert("CLEARERROR Network Error. Please check your connection and try again later!", function(){});
            document.body.className = 'vbox viewport';
        }
    }

    //Unlock project that has been closed due to speech job
    module.unlock_project = function() {
        if(selected == -1) {
            alertify.alert("Please select a project to unlock!", function(){});
            return false;
        }
        var obj = projects["projects"][selected];

        if(notset.indexOf(obj["jobid"]) !== -1) {
            alertify.alert("This project is not currently locked by speech service request!", function(){});
            return false;
        }

        document.body.className = 'vbox viewport waiting';
	    var data = {};
	    data["token"] = localStorage.token;
        data["projectid"] = obj["projectid"];
	    appserver_send(APP_PUNLOCKPROJECT, data, unlock_project_callback);
    }

    //unlock project callback
    function unlock_project_callback(xmlhttp) {
	    if ((xmlhttp.status==503)) {
		    alertify.alert("Application server unavailable", function(){});
	    }

	    if ((xmlhttp.readyState==4) && (xmlhttp.status != 0)) {
		    var response_data = JSON.parse(xmlhttp.responseText);
		    if(xmlhttp.status==200) {
                alertify.success("Unlocked project!");
                get_projects();
                document.body.className = 'vbox viewport';
		    } else { // Something unexpected happened
			    alertify.alert("UNLOCKPROJECT ERROR: " + response_data["message"], function(){});
                document.body.className = 'vbox viewport';
		    }
	    }

        if ((xmlhttp.readyState==4) && (xmlhttp.status == 0)) {
            alertify.alert("UNLOCKPROJECT Network Error. Please check your connection and try again later!", function(){});
            document.body.className = 'vbox viewport';
        }
    }

    // User is trying to logout
    module.logout = function() {
        document.body.className = 'vbox viewport waiting';
	    var data = {};
	    data['token'] = localStorage.getItem("token");
	    appserver_send(APP_PLOGOUT, data, logout_callback);
    }

    // Callback for server response
    function logout_callback(xmlhttp) {
	    // No running server detection
	    if ((xmlhttp.status==503)) {
		    alertify.alert("Application server unavailable", function(){});
	    }

	    if ((xmlhttp.readyState==4) && (xmlhttp.status != 0)) {
		    var response_data = JSON.parse(xmlhttp.responseText);

		    // Logout application was successful
		    if(xmlhttp.status==200) {
               var items = ["username", "token", "home", "role"];
                for(var ndx = 0; ndx < items.length; items++) {
        	        localStorage.setItem(items[ndx], '');
        	        localStorage.removeItem(items[ndx]);
                }
                document.body.className = 'vbox viewport';
        		window.location.assign(HOME_URL);
		    } else { // Something unexpected happened
			    alertify.alert("LOGOUT ERROR: " + response_data["message"] + "\n(Status: " + xmlhttp.status + ")", function(){});
                document.body.className = 'vbox viewport';
		    }
	    }

        if ((xmlhttp.readyState==4) && (xmlhttp.status == 0)) {
            alertify.alert("LOGOUT Network Error. Please check your connection and try again later!", function(){});
            document.body.className = 'vbox viewport';
        }
    }

     // User wants to change their password
    function changepassword() {
        document.getElementById("defproject").click();

        var ps = document.getElementById("projectspace");
        ps.innerHTML = "";

        help_message = "<h1>Project Manager Page</h1><hr>";
        help_message += "<p>Update your password.</p>";
        help_message += "<h2>Update Password</h2>";
        help_message += "<p>You can update your password at any stage using the update password interface. ";
        help_message += "<strong>You have to change your password if the administrator resets your password</strong>.</p> ";

        help_message += "<h2>Buttons</h2>";
        help_message += "<p><b>Refresh</b> -- refresh the project list.<br>";
        help_message += "<b>Update Password</b> -- update your password once you have typed the new password twice.<br>";
        help_message += "<b>Cancel</b> -- cancel the update password process.</p>";

        help_message += "<h2>Navigation</h2>";
        help_message += "<p><b>Home</b> -- return you to the Home page.<br>";
        help_message += "<b>Refresh Projects</b> -- refresh the project list.<br>";
        help_message += "<b>Create Project</b> -- create a new project.<br>";
        help_message += "<b>Update Password</b> -- update your password.<br>";
        help_message += "<b>Logout</b> -- logout and return to the Home page.<br>";
        help_message += "<b>Help</b> -- provides this message.</p>";

        var context;
        context = "<fieldset><legend>New Password</legend><table class='project'>";
        context += "<tr><td style='text-align: left;'><label>Password: </label></td>";
        context += '<td><input id="password" name="password" placeholder="" type="password" maxlength="32"/></td></tr>';
        context += "<tr><td style='text-align: left;'><label>Re-type Password: </label></td>";
        context += '<td><input id="repassword" name="repassword" placeholder="" type="password" maxlength="32"/></td></tr>';
        context += '</select></td></tr>';

        context += '<tr><td><button onclick="Project.update_password()">Update Password</button></td>';
        context += '<td style="text-align: right;"><button onclick="Project.password_cancel()">Cancel</button></td></tr></table></fieldset>';
        ps.innerHTML = context;

    }
    module.changepassword = function() { changepassword(); };

    // User wants to change password
    module.update_password = function() {
        document.body.className = 'vbox viewport waiting';
        var password = document.getElementById("password").value;
        var repassword = document.getElementById("repassword").value;

        if(password == "") {
            alertify.alert("Please enter password!", function(){});
            document.body.className = 'vbox viewport';
            return false;
        }

        if(repassword == "") {
            alertify.alert("Please re-type password!", function(){});
            document.body.className = 'vbox viewport';
            return false;
        }

        if(password != repassword) {
            alertify.alert("The passwords do not match!", function(){});
            document.body.className = 'vbox viewport';
            return false;
        }

	    var data = {};
	    data['token'] = localStorage.getItem("token");
        data["password"] = password;
	    appserver_send(APP_PCHANGEPASSWORD, data, update_password_callback);
    }

    // Callback for server response
    function update_password_callback(xmlhttp) {
	    // No running server detection
	    if ((xmlhttp.status==503)) {
		    alertify.alert("Application server unavailable", function(){});
	    }

	    if ((xmlhttp.readyState==4) && (xmlhttp.status != 0)) {
		    var response_data = JSON.parse(xmlhttp.responseText);
		    // Logout application was successful
		    if(xmlhttp.status==200) {
			    alertify.alert("Password updated!", function(){});
                get_projects();
                document.body.className = 'vbox viewport';
		    } else { // Something unexpected happened
			    alertify.alert("CHANGEPASSWORD ERROR: " + response_data["message"] + "\n(Status: " + xmlhttp.status + ")", function(){});
                document.body.className = 'vbox viewport';
		    }
	    }

        if ((xmlhttp.readyState==4) && (xmlhttp.status == 0)) {
            alertify.alert("CHANGEPASSWORD Network Error. Please check your connection and try again later!", function(){});
            document.body.className = 'vbox viewport';
        }
    }

    // User cancelled password update
    module.password_cancel = function() {
        display_projects(projects);
    }

  // Return a help message for the context
    module.help = function() {
        if(help_message.length > 0) {
            alertify.alert("Help", help_message, function(){});
        } else {
            alertify.alert("Help", "Sorry no help provided for this context!");
        }
    }

    return module;

})(window, document, jQuery);

