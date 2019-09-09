var camera, scene, renderer,cameraControl;

var w = 5;
var h = 5;
var d = 5;
var distance = 6;

//cannon 設定
var world;
var groundBody;
var shapeBody;
var shape;
var friction = 0.6;
var restitution = 0.75;
var shapeGroundContact;

function init() {

    //three 場景
    scene = new THREE.Scene();
    renderer = new THREE.WebGLRenderer({
        antialias: true  //渲染毛邊比較少
    })
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enable = true;

    document.body.appendChild(renderer.domElement);

    // 相機
     camera =  new THREE.OrthographicCamera(window.innerWidth / -40, window.innerWidth / 40, window.innerHeight / 40, window.innerHeight / -40, 1, 1000); 
     camera.position.set(220, 80, 220);
     camera.lookAt(scene.position);


    //  // XYZ 輔助線
     var axes = new THREE.AxesHelper(20);
     scene.add(axes);

    radialWave = function (u, v) {
        var r = 50;

        var x = Math.sin(u) * r;
        var z = Math.sin(v / 2) * 2 * r;
        var y = (Math.sin(u * 4 * Math.PI) + Math.cos(v * 2 * Math.PI)) * 2.8;

        return new THREE.Vector3(x, y, z);
    };


     //cannon 物理世界
     world = new CANNON.World();
     // 設定重力場 為Y軸 
     world.gravity.set(0, -65, 0);   // 一般是-9.8 可控制掉落速度
     //碰撞測試
     world.broadphase = new CANNON.NaiveBroadphase();

     // 建立地板剛體
     var groundShape = new CANNON.Plane();
     var groundCM = new CANNON.Material();
     var groundBody = new CANNON.Body({
         mass:0,
         shape: groundShape,
         material: groundCM
     })

     //旋轉 X 軸-90度
     groundBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2);
     world.add(groundBody);

    // 建立圓體剛體 
    var shapeCM = [];
    // console.log(shapeCM)
    var i = 0;
    for(var x=0; x<3; x++) {
        for(var z=0; z<3; z++) {
            i++;
            shapebox = new CANNON.Sphere(2);
            var shapeCMD = new CANNON.Material();
            shapeCM.push(shapeCMD)
            shapeBody = new CANNON.Body({
                mass:1+(x*4)+(z*5),
                shape: shapebox,
                material: shapeCMD
            })
            shapeBody.position.set(x*distance*4/2-distance*4/2, 0, z*distance*4/2-distance*4/2); 
            world.add(shapeBody);
        }
    }


     //設定兩剛體碰撞的交互作用
     for(var i = 0; i<9;i++) {
        shapeGroundContact = new CANNON.ContactMaterial(groundCM, shapeCM[i], {
            friction: friction,
            restitution: restitution //反彈程度
        })
        world.addContactMaterial(shapeGroundContact)
   
     }

     
     //THREE 地板網格
     var groundGeometry = new THREE.PlaneGeometry(500, 500);
     var groundMaterial = new THREE.MeshLambertMaterial({
        color: 11673893,
        side: THREE.DoubleSide
      })
     var ground = new THREE.Mesh(groundGeometry, groundMaterial)
     ground.rotation.x = -Math.PI / 2;
     ground.receiveShadow = true;
     scene.add(ground);

    //THREE 圓形網格
    group = new THREE.Object3D();  //物件群組
    scene.add(group); 

    for(var x=0; x<3; x++) {
        for(var z=0; z<3; z++) {
            var shapeGeometry = new THREE.SphereGeometry( 2, 32, 32 );
            var shapeMaterial = new THREE.MeshLambertMaterial({ color: 16748339 });
            shape = new THREE.Mesh(shapeGeometry, shapeMaterial);
            shape.castShadow = true;
            shape.name = name;
            shape.position.set(x*distance*4/2-distance*4/2, 0, z*distance*4/2-distance*4/2);
            group.add(shape);
        }
    }


     //THREE 燈光
     var ambientLight = new THREE.AmbientLight("#333");
     scene.add(ambientLight);
 
     var directionalLight = new THREE.DirectionalLight( 0xffffff, 0.5 ); //0.5 是強度  //平行燈
     scene.add(directionalLight);
 
     var spotLight = new THREE.SpotLight( "#fff" );  // 聚光燈
     spotLight.position.set( -20, 20, 10 );
     spotLight.castShadow = true;
     scene.add(spotLight);


     //控制攝影機
     cameraControl = new THREE.OrbitControls(camera)

    loop();

    var oldArr = [] //上一個陣列

    function loop() {

        setTimeout(function(){ 
                    
            var arr=[];
          

            for(var i=0;i<9;i++){
                arr.push(i);
            }
            arr.sort(function(){//隨機打亂這個陣列
                return Math.random()-0.5;
                })
            var arrLen = 4;
            arr.length = arrLen;//改寫長度
     
            for(var i=0; i<4;i++) {
                var randomN = arr[i]
      
                if(randomN!== oldArr[i] && randomN!== oldArr[i+1] && randomN!== oldArr[i+2] && randomN!== oldArr[i+3]) {
                    ballmove(randomN)
                    console.log(randomN)
                }
            }
            oldArr = []
            for(var i=0; i<4;i++) {
                
                oldArr.push(arr[i]);
                // console.log(oldArr[i])
            }
            loop();
        }, 3000);

        
    }

    function ballmove(randomN) {

        var random = Math.floor(Math.random()*8+2);
        // console.log(random)
        var random1 = Math.random()*1-0.5;
        var random2 = Math.random()*0.5-0.5;
        var tl = new TimelineMax({
            // yoyo: true,
            ease: Elastic.easeOut,
        });
        tl.to(world.bodies[randomN].position, 0, {y: world.bodies[randomN].position.y * random})
        tl.to(world.bodies[randomN].position, 0, {x: world.bodies[randomN].position.x + random1})
        tl.to(world.bodies[randomN].position, 0, {z: world.bodies[randomN].position.z + random2})


    }

}

    // window.addEventListener("click", function(){
    //     var arr=[];
    //     for(var i=1;i<10;i++){
    //         arr.push(i);
    //     }
    //     arr.sort(function(){//隨機打亂這個陣列
    //         return Math.random()-0.5;
    //         })
    //     var arrLen = 4;
    //     arr.length = arrLen;//改寫長度
    //     console.log(arrLen);
    //     for(var i=0; i<4;i++) {
    //         var randomN = arr[i]
    //         ballmove(randomN)
    //         console.log(randomN)
    //     }
    // });

init();

var timeStep = 1 / 60; 

function render() {

    world.step(timeStep)

    renderer.render(scene, camera);

    //更新攝影機
    cameraControl.update();

    for(var i=1; i<10; i++) {
        group.children[i-1].position.copy(world.bodies[i].position);
        group.children[i-1].quaternion.copy(world.bodies[i].quaternion);
    }

    requestAnimationFrame(render)
}

render();