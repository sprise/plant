import mongo from '../../../../lib/db/mongo';
import assert from 'assert';
import constants from '../../../../app/libs/constants';
import * as helper from '../../../helper';

import d from 'debug';
const debug = d('plant:test.mongo');

describe('/lib/db/mongo/', function() {
  this.timeout(10000);
  let userId;
  let fbUser;

  before('should create a user account through the helper', (done) => {
    helper.createUser((err, user) => {
      debug('createUser result:', user);
      fbUser = user;
      userId = fbUser._id;
      assert(userId);
      assert.equal(typeof userId, 'string');
      Object.freeze(fbUser);
      done();
    });
  });

  describe('user', () => {
    it('should fail to create a user account if there is no object', (done) => {

      mongo.findOrCreateFacebookUser(null, (err, body) => {

        assert(err);
        assert.equal(err.message, 'No facebook.id:');
        assert(!body);
        assert.equal(typeof userId, 'string');

        done();
      });
    });

    it('should fetch the just-created user', (done) => {

      const user = {
        facebook: {
          id: fbUser.facebook.id
        },
      };

      mongo.findOrCreateFacebookUser(user, (err, body) => {
        // TODO: This test is WIP
        assert(!err);
        assert(body);
        assert(body._id);
        assert(constants.mongoIdRE.test(body._id));
        assert.deepStrictEqual(body, fbUser);
        assert.equal(typeof userId, 'string');

        done();
      });
    });

  });

  describe('plant', () => {
    const plant = {
      name: 'Plant Name',
      plantedOn: new Date(2015, 7, 1)
    };

    it('should create a plant', (done) => {
      plant.userId = userId;
      debug('plant:', plant);
      assert.equal(typeof plant.userId, 'string');
      mongo.createPlant(plant, (createPlantErr, body) => {
        debug('createPlantErr:', createPlantErr);
        assert(!createPlantErr);
        assert(body);
        assert(body._id);
        assert(plant._id);
        assert.equal(typeof body._id, 'string');
        assert.equal(typeof body.userId, 'string');
        assert.equal(typeof plant.userId, 'string');

        done();
      });
    });

    it('should get an existing plant', (done) => {

      mongo.getPlantById(plant._id, (err, result) => {
        debug('getPlantById result:', result);
        assert.equal(typeof result.userId, 'string');
        assert.equal(typeof plant.userId, 'string');
        assert(!err);
        assert(result);
        assert.equal(result.name, plant.name);
        const plantedOn = new Date(result.plantedOn);
        assert.equal(plantedOn.getTime(), plant.plantedOn.getTime());
        debug('result.userId:', result.userId);
        debug('plant.userId:', plant.userId);
        debug('typeof result.userId:', typeof result.userId);
        debug('typeof plant.userId:', typeof plant.userId);
        assert.equal(result.userId, plant.userId);
        done();
      });
    });

    it('should update an existing plant with "Set"', (done) => {

      const plantUpdate = {
        name: 'New Name',
        other: 'Other Text',
        _id: plant._id,
        userId
      };

      mongo.updatePlant(plantUpdate, (err, result) => {
        debug('update with Set err:', err);
        debug('update with Set result:', result);
        assert(!err);
        assert.equal(result.ok, 1);
        // Mongo 2.x does not return nModified which is what Travis uses so do not check this
        // assert.equal(result.nModified, 1);
        assert.equal(result.n, 1);
        done();
      });
    });

  });
});