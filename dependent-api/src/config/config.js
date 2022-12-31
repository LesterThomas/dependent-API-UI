const config = {
    k8sAPIBaseUrl: '/k8s/clusters/c-7rxjk/',
    ODAAPIVersion: 'v1alpha4/',
    ODAAPI: 'apis/oda.tmforum.org/',
    ComponentsNamespace: 'components/',
    ComponentsResource: 'components/',
    ExposedAPIsResource: 'apis/',
    DependentAPIsResource: 'dependenentapis/',
    AppsAPI: 'apis/apps/v1/',
    CoreAPI: 'api/v1/',
    BatchAPI: 'apis/batch/v1/',
    CronJobAPI: 'apis/batch/v1beta1/',
    RbacAPI: 'apis/rbac.authorization.k8s.io/v1/',
    DeploymentsResource: 'deployments/',
    StatefulSetsResource: 'statefulsets/',
    ServicesResource: 'services/',
    JobsResource: 'jobs/',
    CronJobsResource: 'cronjobs/',
    PersistentVolumeClaimsResource: 'persistentvolumeclaims/',
    ConfigMapsResource: 'configmaps/',
    SecretsResource: 'secrets/',
    ServiceAccountsResource: 'serviceaccounts/',
    RoleResource: 'roles/',
    RoleBindingResource: 'rolebindings/',
    LabelSelector: '?labelSelector=oda.tmforum.org/componentName='
  };
// example K8s GET request to get deployments for a component:
// https://rke.tmforum.org/k8s/clusters/c-7rxjk/apis/apps/v1/namespaces/components/deployments?labelSelector=oda.tmforum.org%2FcomponentName%3Dr4-productinventory&limit=500
// example K8s GET request to get services for a component:
// https://rke.tmforum.org/k8s/clusters/c-7rxjk/api/v1/namespaces/components/services?labelSelector=oda.tmforum.org%2FcomponentName%3Dr4-productinventory&limit=500
// example K8s GET request to get StateFulSets for a component:
// https://rke.tmforum.org/k8s/clusters/c-7rxjk/apis/apps/v1/namespaces/components/statefulsets?labelSelector=oda.tmforum.org%2FcomponentName%3Dr4-productinventory&limit=500
  
  export default config;
  