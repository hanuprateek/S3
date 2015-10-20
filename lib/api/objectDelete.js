import utils from '../utils.js';
import services from '../services.js';
import async from 'async';

/**
 * objectDelete - DELETE an object from a bucket
 * (currently supports only non-versioned buckets)
 * @param  {string}   accessKey - user access key
 * @param  {object}   datastore - data storage endpoint
 * @param  {object}   metastore - metadata storage endpoint
 * @param  {object}   request   - request object given by router,
 * includes normalized headers
 * @param  {function} callback  - final callback to call with the
 * result and response headers
 * @return {function} calls callback from router
 * with err, result and responseMetaHeaders as arguments
 */

export default
function objectDelete(accessKey, datastore,  metastore, request, callback) {
    const resourceRes = utils.getResourceNames(request);
    const bucketname = resourceRes.bucket;
    const bucketUID = utils.getResourceUID(request.namespace, bucketname);
    const objectKey = resourceRes.object;
    const objectUID =
    utils.getResourceUID(request.namespace, bucketname + objectKey);
    const metadataValParams = {
        accessKey: accessKey,
        bucketUID: bucketUID,
        objectUID: objectUID,
        metastore: metastore,
        objectKey: objectKey
    };
    const metadataCheckParams = {
        headers: request.lowerCaseHeaders
    };
    async.waterfall([
        function waterfall1(next) {
            services.metadataValidateAuthorization(metadataValParams, next);
        },
        function waterfall2(bucket, objectMetadata, next) {
            services.metadataChecks(bucket, objectMetadata,
                metadataCheckParams, next);
        },
        function waterfall3(bucket, objectMetadata, metaHeaders, next) {
            services.deleteObjectFromBucket(bucket, objectMetadata,
            metaHeaders, datastore,  objectUID, next);
        }
    ], function waterfallFinal(err, result, responseMetaHeaders) {
        return callback(err, result, responseMetaHeaders);
    });
}