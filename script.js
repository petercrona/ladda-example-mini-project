var ladda = require('ladda-cache');

// 1. Mock backend
getProject.operation = 'READ';
function getProject(id) {
    console.log('getProject(' + id + ') request sent');
    return Promise.resolve({
        id: 1,
        name: 'Docs',
        description: 'Write Ladda Docs'
    });
}

updateProject.operation = 'UPDATE';
function updateProject(newObject) {
    console.log('updateProject request sent');
    return Promise.resolve();
}

getProjectPreviews.operation = 'READ';
getProjectPreviews.plural = true;
function getProjectPreviews() {
    console.log('getProjectPreviews request sent');
    return Promise.resolve([
        {
            id: 1,
            name: 'Docs',
        },
        {
            id: 2,
            name: 'Mini example',
        }
    ]);
}

// 2. Define APIs (objects with methods that return promises)
const apiProject = {
    getProject: getProject,
    updateProject: updateProject,
};

const apiProjectPreview = {
    getProjectPreviews: getProjectPreviews
};

// 3. Configure Ladda
const config = {
    project: {
        ttl: 300,
        api: apiProject
    },
    projectPreview: {
        ttl: 300,
        api: apiProjectPreview,
        viewOf: ['project']
    }
};

// 4. Build API client
const api = ladda.build(config);

// 5. Excute example
Promise.resolve()
    .then(api.projectPreview.getProjectPreviews)
    .then(printResult)
    .then(api.project.getProject.bind(null, 1))
    .then(printResult)
    .then(api.project.updateProject.bind(null, { id: 1, name: 'new name', description: 'new desc'}))
    .then(api.projectPreview.getProjectPreviews)
    .then(printResult);

function printResult(res) {
    console.log(res);
}

/* 6. Conclusion

   We get the following output:

   >> getProjectPreviews request sent
   >> [Object, Object]
   >> getProject(1) request sent
   >> {id: 1, name: "Docs", description: "Write Ladda Docs"}
   >> updateProject request sent
   >> [{id: 1, name: "new name"},
       {id: 2, name: "mini example"}]

   Note that after updating our projects we are getting the project previews.
   No request is sent. However, we still get the latest update even though it was made
   to Project and not ProjectPreview. This is thanks to the "viewOf" declaration.

   Note that the updated version do in fact contain "description".
   Ladda only guarantees that the fields in the view are available, not that
   ONLY the fields in the view are available when a super type is updated.

 */
