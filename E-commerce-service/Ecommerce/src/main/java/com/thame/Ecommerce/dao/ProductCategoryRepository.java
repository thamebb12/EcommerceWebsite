package com.thame.Ecommerce.dao;

import com.thame.Ecommerce.entity.ProductCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;
import org.springframework.stereotype.Repository;
import org.springframework.web.bind.annotation.CrossOrigin;

//@CrossOrigin("http://localhost:4200")
@RepositoryRestResource(collectionResourceRel = "productsCategory", path = "products-category")
public interface ProductCategoryRepository extends JpaRepository<ProductCategory, Long> {
}
