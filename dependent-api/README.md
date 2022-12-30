# Running

Run this app with K8s access by setting up your `kubectl` to access your Kubernetes cluster and then typing:

```bash
kubectl proxy --www=.   --www-prefix=/static/
```

This runs a web server and proxies the Kubernetes API on at the same localhost port (removing any CORS issues)

**THERE IS AN ISSUE WITH CROME BROWSER THAT ALWAYS DIRECTS API REQUESTS TO HTTPS - CAUSING THIS TO FAIL** It works with Firefox.