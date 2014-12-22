var urls = require('../static/js/modules/urls.js');

module.exports = {
    getPaginationValues: function(context) {
        var paginationContext = {
                filters: {}
            },
            pagination = context.data.pagination;

        paginationContext.resultsCount = pagination.count;
        paginationContext.page = pagination.page;

        context.filters = context.filters || {};

        // if we are not at the last page, build next page url
        if (pagination.page < pagination.pages) {
            // bump up page to build next page's url
            context.filters.page = pagination.page + 1;
            paginationContext.nextURL = urls.buildURL(context);

            // reset page filter
            context.filters.page = pagination.page;
        }

        // if this is not the first page, build prev page url
        if (pagination.page > 1) {
            // drop page number down to build prev page url
            context.filters.page = pagination.page - 1;
            paginationContext.prevURL = urls.buildURL(context);

            // reset page filter
            context.filters.page = pagination.page;
        }
        if (paginationContext.prevURL || paginationContext.nextURL) {
            paginationContext.paginationLinks = true;
        }

        paginationContext.perPage = pagination.per_page;
        paginationContext.currentResultsStart = paginationContext.perPage * (paginationContext.page - 1) + 1;
        paginationContext.currentResultsEnd = paginationContext.perPage * paginationContext.page;

        if (paginationContext.currentResultsEnd > paginationContext.resultsCount) {
            paginationContext.currentResultsEnd = paginationContext.resultsCount;
        }

        if (paginationContext.currentResultsEnd && paginationContext.currentResultsStart) {
            paginationContext.resultsRange = true;
        }

        return paginationContext;
    }
}
