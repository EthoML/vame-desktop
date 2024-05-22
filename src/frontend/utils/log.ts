export default {
    load: {
      onRequest: function () { this.log(`Loading project...`) },
      onSuccess: function ({ config } ) {
          console.warn('config', config)
         if (config) this.log(`Project loaded`)
         else this.log(`Project could not be loaded`)
       }
   },
    configure: {
      onRequest: function () { this.log(`Updating configuration file...`) },
      onSuccess: function () { this.log(`Configuration updated!`) },
    },
    align: {
      onRequest: function () { this.log(`Aligning data egocentrically...`) },
      onSuccess: function () { this.log(`Data has been aligned!`) },
    },
    create_trainset: {
      onRequest: function () { this.log(`Creating trainset...`) },
      onSuccess: function () { this.log(`Trainset created!`) },
    },
    train: {
      onRequest: function () { this.log(`Training model...`) },
      onSuccess: function () { this.log(`Model trained!`) },
    },
    evaluate: {
      onRequest: function () { this.log(`Evaluating model...`) },
      onSuccess: function () { this.log(`Model evaluated!`) },
    },
    segment: {
      onRequest: function () { this.log(`Running pose segmentation...`) },
      onSuccess: function () { this.log(`Pose segmentation finished!`) },
    },
    delete: {
      onRequest: function () {},
      onSuccess: function ({ deleted }) {
        if (deleted) this.log(`Project deleted`)
        else this.log(`Project already does not exist`)
      }
    }
  }
  