$(document).ready(function() {
    $('#product-list-table').on('click', 'th', function(e) {
        e.preventDefault();
        let sort_order = $('#sort_order').val();
        let sort_by = $(this).attr('id');
        if ($('#sort_by').val() == $(this).attr('id')) {
            sort_order = sort_order == 'ASC' ? 'DESC' : 'ASC';
        }

        $.ajax({
            method: 'GET',
            url: '/users/product/index/ajax',
            dataType: 'html',
            data: {
                sort_by: $(this).attr('id'),
                sort_order: sort_order || 'ASC',
                page: parseInt($('#current_page').html())
            },
            success: function(data) {
                $('#product-list-table').html(data);
                $('#sort_by').val(sort_by);
                $('#sort_order').val(sort_order);
            },
        });
    });
});