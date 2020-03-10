let db;
        let dbReq = indexedDB.open('blogDatabase', 1);

        dbReq.onupgradeneeded = function(event) {
            db = event.target.result;

            let blogs;
            if(!db.objectStoreNames.contains('blogs')) {
                blogs = db.createObjectStore('blogs', {
                    autoIncrement: true
                });
            }
            else {
                blogs = dbReq.transaction.objectStore('blogs');
            }

            if(!blogs.indexNames.contains('timestamp')) {
                blogs.createIndex('timestamp', 'timestamp');
            }
        }

        dbReq.onsuccess = function(event) {
            db = event.target.result;
            getAndDisplayBlogs(db);
        }

        dbReq.onerror = function(event) {
            alert('Error in opening database');
        }

        function addBlog(db, blogName, author) {
            let tx = db.transaction(['blogs'], 'readwrite');
            let store = tx.objectStore('blogs');

            let blog = { title: blogName, author: author, timestamp: Date.now() };
            store.add(blog);

            tx.oncomplete = function() {
                getAndDisplayBlogs(db);
            };

            tx.onerror = function(event) {
                alert('Error in storing blog');
            };
        }

        function getAndDisplayBlogs(db) {
            let tx = db.transaction(['blogs'], 'readonly');
            let store = tx.objectStore('blogs');
            
            let index = store.index('timestamp');

            let req = index.openCursor(null);
            let allBlogs = [];


            req.onsuccess = function(event) {
                let cursor = event.target.result;
                if(cursor != null) {
                    allBlogs.push(cursor.value);
                    cursor.continue();
                }
                else {
                    displayBlogs(allBlogs);
                }
            }

            req.onerror = function(event) {
                alert('Error in cursor request');
            }
        }

        function submitBlog() {
            let blogName = document.getElementById('blogTitle').value;
            let author = document.getElementById('author').value;
            addBlog(db, blogName, author);
            blogName.value = '';
            author.value = '';
        }

        function deleteDB() {
            indexedDB.deleteDatabase('blogDatabase');
        }

        function displayBlogs(blogs) {
            let blogList = '<ul>';
            for(let i = 0; i < blogs.length; i++) {
                let blog = blogs[i];
                blogList += '<li><h3>' + blog.title + '</h3><p>' + blog.author + '</p></li>';
            }
            document.getElementById('blog-list').innerHTML = blogList;
        }