# [0:00] Created Repo


# [3:32] Added Route Protections
Both the frontend and backend need route protections.

Before rendering a secure page in the frontend, it will check whether or not the localStorage has a field named 'token'. This is the JWT access token that the user recieves after they login. If they have this token, the ProtectedPage component in the frontend will allow them to access the secure page.

In the backend, there will be certain endpoints that will need to be secured (like endpoints for inserting and retrieving user data). There will also be endpoints that anyone can access (like login or register). We don't want unverified people accessing the secure endpoints. Thus flask has an @jwt_required header to protect certain endpoints. If a user tries to access a protected endpoint without a valid JWT token, they will get a 401 error.

Additonally, sometimes we want to access the current user's information. We will use the get_jwt_identity() function to get the current user's information. This will be useful for when we want to get the current user's information to display on the frontend.

# [4:27] Separated app.py into blueprints
Flask has a feature called blueprints. 

We don't want to put all your endpoints in app.py. We can separate them. For example, auth endpoints with go in auth.py. We can then import auth.py in app.py and register the blueprint using:
app.register_blueprint(auth, url_prefix='/auth')  # Registering the Blueprint

The url_prefix will mean that instead of hitting localhost/login, we now hit localhost/auth/login.

# [9:24] Added ability to delete files
The way the user initiates a delete is by clicking on the trash icon in react-file-tree. Because this is a library, the only data we get is the old tree and the new tree. We don't know which file was deleted. Thus, we need to compare the old tree and the new tree to find the deleted file. So this is what we do.
1. We get the old tree and the new tree.
2. We find the difference between the old tree and the new tree. This will give us the deleted file, we identify this file by name. (This could cause some issues if there are files with the same name)
3. We send the deleted file to the backend. The backend takes the file by id. In order to accomplish this, we have a hashmap that stores key: name, value: id. We can then use the name to get the id and delete the file. This hashmap is populated whenever the file tree is rendered.

Notes regarding oldTree and newTree.
I was stuck on this issue for a long time where it seemed like whenever the onTreeUpdate function gets called, oldTree and newTree contain the same information according to the logs. Thus the deletion call was never made. The issue was that I was doing:
prevTreeRef.current = newTree; At the end of the function. For some reason, whenever the onTreeUpdate function gets called, prevTreeRef got updated before the 

comparisons could be made. The fix was to do:
  prevTreeRef.current = deepClone(newTree);
With deepClone being:
  const deepClone = (obj:ITree) => JSON.parse(JSON.stringify(obj));

This way, prevTreeRef.current is a deep clone of newTree and the comparisons can be made.
I think it issue is that react and js automaticallys sets prevTreeRef to the *reference* of newTree if I use the old method. Thus they will always be the same. using deepClone will create a completely new object. 


Libaraies used:
https://www.npmjs.com/package/react-folder-tree
https://www.npmjs.com/package/react-modal
